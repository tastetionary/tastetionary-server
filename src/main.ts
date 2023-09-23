import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { winstonLogger } from '@utils/winston.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('API_SERVER_PORT') as number;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const docs = require('../../packages/api/swagger.json');
  docs.servers = [
    {
      url: `${app.getUrl}:${port}`,
    },
  ];
  SwaggerModule.setup('api', app, docs);
  await app.listen(port);
}

bootstrap();
