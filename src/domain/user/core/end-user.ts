import { UserRepository } from '@domain/user/repository/user.repository';
import { UserState } from '@domain/user/user.enum';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import {
  AgreementDTO,
  AreaDto,
  UserPropertyDto,
} from '@domain/user/dto/user.dto';
import * as nicknameSource from '@domain/user/resource/nickname.json';
import { getRandomItem } from '@common/util';
import { AreaRepository } from '@domain/user/repository/area.repository';

export class EndUser {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly agreementRepo: AgreementRepository,
    private readonly areaRepo: AreaRepository,
  ) {}

  async register(
    agreeDtoList: AgreementDTO[],
    areaDtoList: AreaDto[],
    userProperty: UserPropertyDto,
  ) {
    const nickname = this.getNickname();

    const user = await this.userRepo.saveUser({
      state: UserState.ACTIVE,
      nickname,
      property: userProperty,
    });

    const params = agreeDtoList.map((dto) => {
      return { userId: user.id, ...dto };
    });
    await this.agreementRepo.saveAgreements(params);

    const areaParams = areaDtoList.map((dto) => {
      return {
        userId: user.id,
        order: 0,
        category: dto.category,
        address: dto.address,
        location: { latitude: dto.latitude, longitude: dto.longitude },
      };
    });
    await this.areaRepo.saveAreas(areaParams);

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
