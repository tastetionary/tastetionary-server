import { UserRepository } from '@domain/user/repository/user.repository';
import { UserState } from '@domain/user/user.enum';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AgreementDTO } from '@domain/user/dto/user.dto';

export class EndUser {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly agreementRepo: AgreementRepository,
  ) {}

  async register(dtoList: AgreementDTO[]) {
    const nickname = this.getNickname();
    const user = await this.userRepo.saveUser({
      state: UserState.ACTIVE,
      nickname,
      property: {},
    });

    const params = dtoList.map((dto) => {
      return { userId: user.id, ...dto };
    });
    await this.agreementRepo.saveAgreements(params);

    return user;
  }

  protected getNickname() {
    return 'random nickname';
  }
}
