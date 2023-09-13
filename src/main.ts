import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { winstonLogger } from '@utils/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  const config = app.get(ConfigService);
  const port = config.get<number>('API_SERVER_PORT') as number;

  await app.listen(port);
}
bootstrap();
