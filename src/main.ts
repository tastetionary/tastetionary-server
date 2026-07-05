import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { winstonLogger } from '@utils/winston.config';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';
import { NextFunction, Request, Response } from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const SWAGGER_PATH = 'api';

function initSentry(dsn: string, env: string) {
  Sentry.init({
    dsn,
    environment: env,
  });
}

function loadSwaggerDocument(): OpenAPIObject {
  const candidates = [
    join(__dirname, '../swagger.json'),
    join(__dirname, '../../packages/api/swagger.json'),
    join(process.cwd(), 'packages/api/swagger.json'),
  ];
  const path = candidates.find(existsSync);
  if (!path) {
    throw new Error(
      `swagger.json not found, searched: ${candidates.join(', ')}`,
    );
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const config = app.get(ConfigService);
  const url = config.get<string>('API_SERVER_URL') as string;
  const port = config.get<number>('API_SERVER_PORT') as number;

  app.use(helmet({ contentSecurityPolicy: false }));

  const contentSecurityPolicy = helmet.contentSecurityPolicy();
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isSwaggerPath =
      req.path === `/${SWAGGER_PATH}` ||
      req.path.startsWith(`/${SWAGGER_PATH}/`);
    return isSwaggerPath ? next() : contentSecurityPolicy(req, res, next);
  });

  const docs = loadSwaggerDocument();
  docs.servers = [
    {
      url: `${url}`,
    },
  ];
  SwaggerModule.setup(SWAGGER_PATH, app, docs);
  const sentryDsn = config.get<string>('SENTRY_DSN') as string;
  const env = config.get<string>('ENV') as string;
  initSentry(sentryDsn, env);

  app.enableShutdownHooks();

  const corsOrigins = (config.get<string>('CORS_ORIGINS') as string)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(port);
}

bootstrap();
