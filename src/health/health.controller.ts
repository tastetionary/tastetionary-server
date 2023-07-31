import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  private readonly apiVersion = '0.0.1';
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      async () => this.http.pingCheck('health check', 'http://localhost:3000'),
    ]);

    const time = new Date().toISOString();
    const isHealthy = result.status === 'ok';
    if (!isHealthy) {
      return { status: 'error', timestamp: time, apiVersion: this.apiVersion };
    }
    return { status: 'ok', timestamp: time, apiVersion: this.apiVersion };
  }
}
