import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { env } from '../../config/env.config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx    = host.switchToHttp();
    const res    = ctx.getResponse();
    const req    = ctx.getRequest();
    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Préserve le détail des erreurs HTTP (validation Zod, etc.)
    const response = isHttp ? exception.getResponse() : null;
    const message  = isHttp
      ? (typeof response === 'object' ? response : { message: exception.message })
      : { message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : String(exception) };

    if (!isHttp) {
      this.logger.error('Unexpected error', { url: req.url, error: exception });
    }

    res.status(status).json({
      statusCode: status,
      ...message,
      timestamp:  new Date().toISOString(),
      path:       req.url,
    });
  }
}