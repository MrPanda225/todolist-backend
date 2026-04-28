import {
  Injectable, NestInterceptor,
  ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map }        from 'rxjs/operators';

function serializeDates(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) return value.toISOString();

  // Objet Prisma Decimal {s, e, d}
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    's' in (value as any) &&
    'e' in (value as any) &&
    'd' in (value as any)
  ) {
    const v = value as any;
    return Number(`${v.s < 0 ? '-' : ''}${v.d.join('')}e${v.e - (v.d.length - 1)}`);
  }

  if (Array.isArray(value)) return value.map(serializeDates);

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([k, v]) => [k, serializeDates(v)]
      )
    );
  }

  return value;
}

@Injectable()
export class SerializeDatesInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(data => serializeDates(data)));
  }
}