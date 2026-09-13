import { Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { RedisService } from './redis.service';
import { closeRedisClient } from './redis.client';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';

const logger = new Logger('Redis');

@Module({
  providers: [
    ConfigurationService,
    {
      provide: 'redisClient',
      useFactory: async (configurationService: ConfigurationService) => {
        const client = createClient({
          url: configurationService.getRedisConfig(),
        });
        client.on('error', (err) => {
          logger.error(
            { message: 'redis client error', errorMessage: err.message },
            err.stack,
          );
        });
        await client.connect();
        return client;
      },
      inject: [ConfigurationService],
    } satisfies FactoryProvider,
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await closeRedisClient();
  }
}
