import { Module } from '@nestjs/common';
import { UserController } from '@domain/user/controller/user.controller';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserService } from '@domain/user/service/user.service';
import { JwtService } from '@nestjs/jwt';
import { AccountModule } from '@domain/account/account.module';
import { AuthenticationModule } from '@domain/authentication/authentication.module';

@Module({
  imports: [AccountModule, AuthenticationModule],
  controllers: [UserController],
  providers: [UserService, JwtService, ConfigurationService],
  exports: [UserService],
})
export class UserModule {}
