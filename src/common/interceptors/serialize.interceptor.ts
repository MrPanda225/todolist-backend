import {
  Injectable, NestInterceptor,
  ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map }        from 'rxjs/operators';

function stripSensitiveFields(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripSensitiveFields);

  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === 'passwordHash') continue;
      sanitized[key] = stripSensitiveFields(value);
    }
    return sanitized;
  }

  return obj;
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(data => stripSensitiveFields(data)));
  }
}