import { UserRepository } from '@domain/user/repository/user.repository';
import { UserState } from '@domain/user/user.enum';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AgreementDTO } from '@domain/user/dto/user.dto';
import * as nicknameSource from '@domain/user/resource/nickname.json';
import { getRandomItem } from '@common/util';

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
    const nicknameList = this.getNicknameFromSource();
    const randomAdj = getRandomItem(nicknameList.adj);
    const randomNameKey = getRandomItem(Object.keys(nicknameList.name));
    const randomName = getRandomItem(nicknameList.name[randomNameKey]);

    return `${randomAdj} ${randomName}`;
  }

  private getNicknameFromSource(): {
    adj: string[];
    name: {
      animal: string[];
      food: string[];
      cooking: string[];
    };
  } {
    return nicknameSource;
  }
}
