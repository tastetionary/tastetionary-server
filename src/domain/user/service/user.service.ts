import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/repository/user.repository';
import { EndUser } from '@domain/user/core/end-user';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AreaRepository } from '@domain/user/repository/area.repository';
import { AccountService } from '@domain/account/service/account.service';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private agreementRepo: AgreementRepository,
    private areaRepo: AreaRepository,
  ) {}
  @Inject(AccountService)
  private readonly accountService: AccountService;

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

    await this.accountService.register(user.id, dto.account);
    return user;
  }
}
