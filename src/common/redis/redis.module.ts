import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { FactoryProvider } from '@nestjs/common';
import { createClient } from 'redis';

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
          console.error('[Redis] client error:', err);
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
export class RedisModule {}
