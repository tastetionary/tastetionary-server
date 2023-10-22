import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly masterToken = 'master-tastionary';
  constructor(
    private jwtService: JwtService,
    private configService: ConfigurationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (this.isMasterToken(request)) {
      const [_, token] = request.headers.authorization?.split(' ') ?? [];
      const [__, userId] = token.split(`${this.masterToken}:`);
      request['user'] = { userId: parseInt(userId) };
      return true;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'no token in request, check Bearer header',
      );
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getTokenData().accessTokenSecret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers

      console.log(payload);
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        'not verified token, maybe expired or invalid or not proper created',
      );
    }
    return true;
  }

  private isMasterToken(request: Request) {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    if (!token) return false;

    return token.includes(this.masterToken);
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
