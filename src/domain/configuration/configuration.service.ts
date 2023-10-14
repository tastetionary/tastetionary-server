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

  getMailGunConfig() {
    return {
      apiKey: this.configService.get<string>('MAIL_GUN_API_KEY', ''),
      domain: this.configService.get<string>(
        'MAIL_GUN_DOMAIN',
        'sandbox3337a931a909471584fd050d91a3d035.mailgun.org',
      ),
      fromEmail: this.configService.get<string>(
        'MAIL_GUN_FROM_EMAIL',
        'no-reply@tastetionary.com',
      ),
      fromTitle: this.configService.get<string>(
        'MAIL_GUN_FROM_TITLE',
        '맛셔너리팀',
      ),
    };
  }
}
