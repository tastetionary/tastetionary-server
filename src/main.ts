import '@src/instrument';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { winstonLogger } from '@utils/winston.config';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NextFunction, Request, Response } from 'express';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { REQUEST_ID_HEADER } from '@common/logging/request-context.middleware';

const SWAGGER_PATH = 'api';

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

  app.enableShutdownHooks();

  const corsOrigins = (config.get<string>('CORS_ORIGINS') as string)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [REQUEST_ID_HEADER],
  });

  await app.listen(port);
}

bootstrap();
