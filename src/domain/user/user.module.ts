import { Module } from '@nestjs/common';
import { UserController } from '@domain/user/controller/user.controller';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AccountModule } from '@domain/account/account.module';
import { AuthenticationModule } from '@domain/authentication/authentication.module';

@Module({
  imports: [AccountModule, AuthenticationModule],
  controllers: [UserController],
  providers: [JwtService, ConfigurationService],
  exports: [],
})
export class UserModule {}
