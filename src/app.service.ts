import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getEnv() {
    const env = this.configService.get<string>('ENV');
    const port = this.configService.get<number>('APP_PORT');
    return {
      env,
      port,
    };
  }
}
