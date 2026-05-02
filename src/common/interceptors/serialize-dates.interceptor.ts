import {
  Injectable, NestInterceptor,
  ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map }        from 'rxjs/operators';

function serializeDates(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (value instanceof Date) return value.toISOString();

  // Prisma Decimal — détecté par le nom du constructeur (plus fiable que {s,e,d})
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (value as any).constructor?.name === 'Decimal'
  ) {
    // .toString() retourne la représentation exacte : "1.5", "0.75", "2.00"
    return parseFloat((value as any).toString());
  }

  if (Array.isArray(value)) return value.map(serializeDates);

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([k, v]) => [k, serializeDates(v)],
      ),
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