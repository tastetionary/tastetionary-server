import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/repository/user.repository';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { EndUser } from '@domain/user/core/end-user';
import { Account } from '@domain/user/core/account';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AreaRepository } from '@domain/user/repository/area.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private accountRepo: AccountRepository,
    private agreementRepo: AgreementRepository,
    private areaRepo: AreaRepository,
  ) {}

  async register(dto: RegisterUserDTO) {
    const endUser = new EndUser(
      this.userRepo,
      this.agreementRepo,
      this.areaRepo,
    );
    const user = await endUser.register(
      dto.agreement,
      dto.area,
      dto.userProperty,
    );

    const account = new Account(this.accountRepo, {
      identification: dto.account.identification,
      password: dto.account.password,
      category: dto.account.category,
    });
    await account.register(user.id);
    return user;
  }
}
