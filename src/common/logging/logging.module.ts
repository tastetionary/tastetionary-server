import { Logger, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogInterceptor } from '@src/common/logging/logging.interceptor';

@Module({
  providers: [Logger, { provide: APP_INTERCEPTOR, useClass: LogInterceptor }],
})
export class LoggingModule {}
