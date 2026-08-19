import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { ConfigurationService } from '@domain/configuration/configuration.service';

function isTokenMatched(received: string, expected: string): boolean {
  const receivedHash = createHash('sha256').update(received).digest();
  const expectedHash = createHash('sha256').update(expected).digest();

  return timingSafeEqual(receivedHash, expectedHash);
}

@Injectable()
export class MetricsTokenGuard implements CanActivate {
  constructor(private readonly configurationService: ConfigurationService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configurationService.getMetricsToken();

    if (!expected) {
      throw new NotFoundException();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token || !isTokenMatched(token, expected)) {
      throw new UnauthorizedException('invalid metrics token');
    }

    return true;
  }
}
