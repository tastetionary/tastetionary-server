import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { winstonLogger } from '@utils/winston.config';
import { SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

function initSentry(dsn: string, env: string) {
  Sentry.init({
    dsn,
    environment: env,
    integrations: [new ProfilingIntegration()],
    profilesSampleRate: 1.0,
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const config = app.get(ConfigService);
  const url = config.get<string>('API_SERVER_URL') as string;
  const port = config.get<number>('API_SERVER_PORT') as number;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const docs = require('../../packages/api/swagger.json');
  docs.servers = [
    {
      url: `${url}`,
    },
  ];
  SwaggerModule.setup('api', app, docs);
  const sentryDsn = config.get<string>('SENTRY_DSN') as string;
  const env = config.get<string>('ENV') as string;
  initSentry(sentryDsn, env);

  app.enableCors({
    origin: ['https://tastetionary.vercel.app/', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELET,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(port);
}

bootstrap();
