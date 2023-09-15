import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServerConfig,
  ServerMetaData,
} from '@domain/configuration/dto/configuration.dto';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) {}

  getServerConfig(): ServerConfig {
    const ENV = this.configService.get<string>('ENV', 'undefined');
    return {
      ENV,
    };
  }

  getServerMetaData(): ServerMetaData {
    return { serverTime: new Date().toISOString(), version: '0.0.1' };
  }

  getDataBaseHost() {
    return this.configService.get<string>('DATABASE_HOST');
  }

  getTokenData() {
    return {
      accessTokenSecret: this.configService.get('ACCESS_TOKEN_SECRET'),
      accessTokenExpiredAt: this.configService.get('ACCESS_TOKEN_EXPIRED_AT'),
      refreshTokenSecret: this.configService.get('REFRESH_TOKEN_SECRET'),
      refreshTokenExpiredAt: this.configService.get('REFRESH_TOKEN_EXPIRED_AT'),
    };
  }
}
