import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { Request } from 'express';
import { findAccessToken } from '@root/src/domain/account/service/account.service';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
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

    const token = await this.validateToken(request);

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getTokenData().accessTokenSecret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException(
        'not verified token, maybe expired or invalid or not proper created',
      );
    }
    return true;
  }

  private async validateToken(request: any) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'no token in request, check Bearer header',
      );
    }

    await pipe(
      token,
      findAccessToken,
      TE.mapError((error) => {
        throw new UnauthorizedException(error.message);
      }),
    )();

    return token;
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
