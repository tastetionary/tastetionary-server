import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private requestLogger = new Logger('HTTP_REQUEST');
  private responseLogger = new Logger('HTTP_RESPONSE');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const executionId = uuid();
    this.logRequest(context, executionId);

    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catchError((error: any) => {
        this.logResponse(context, executionId, error);
        throw error;
      }),
      tap((data) => {
        this.logResponse(context, executionId, data);
      }),
    );
  }

  private logResponse(
    context: ExecutionContext,
    executionId: string,
    data: Record<string, unknown>,
  ) {
    const loggingParams: Record<string, unknown> = {
      executionId,
    };
    if (data instanceof Error) {
      loggingParams.error = { message: data.message };
    }

    this.responseLogger.log(JSON.stringify(loggingParams));
  }

  private logRequest(context: ExecutionContext, executionId: string) {
    const request = context.switchToHttp().getRequest<Request>();
    this.requestLogger.log(
      JSON.stringify({
        executionId,
        path: request.path,
        method: request.method,
      }),
    );
  }
}
