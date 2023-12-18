import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ServerConfig,
  ServerMetaData,
} from '@domain/configuration/dto/configuration.dto';
import { EnvironmentEnum } from '@root/src/env.validation';

@Injectable()
export class ConfigurationService {
  constructor(private configService: ConfigService) {}

  getServerConfig(): ServerConfig {
    const env = this.configService.get<EnvironmentEnum>(
      'ENV',
      EnvironmentEnum.LOCAL,
    );
    return {
      env,
    };
  }

  getServerMetaData(): ServerMetaData {
    return { serverTime: new Date().toISOString(), version: '0.0.1' };
  }

  getDataBaseUrl() {
    return this.configService.get<string>('DATABASE_URL');
  }

  getTokenData() {
    return {
      accessTokenSecret: this.configService.get('ACCESS_TOKEN_SECRET'),
      accessTokenExpiredAt: this.configService.get('ACCESS_TOKEN_EXPIRED_AT'),
      refreshTokenSecret: this.configService.get('REFRESH_TOKEN_SECRET'),
      refreshTokenExpiredAt: this.configService.get('REFRESH_TOKEN_EXPIRED_AT'),
    };
  }

  getBrevoConfig() {
    return {
      apiKey: this.configService.get('BREVO_API_KEY', ''),
      sender: {
        email: this.configService.get(
          'BREVO_SENDER_EMAIL',
          'no-reply@tastetionary.com',
        ),
        name: this.configService.get('BREVO_SENDER_NAME', '맛셔너리팀'),
      },
    };
  }
}
