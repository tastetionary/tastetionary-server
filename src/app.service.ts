import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello() {
    console.log(process.env.NODE_ENV);
    const host = this.configService.get<string>('HOST');
    const port = this.configService.get<number>('APP_PORT');
    return {
      host,
      port,
    };
  }
}
