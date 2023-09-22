import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/repository/user.repository';
import {
  AreaDto,
  RegisterUserDTO,
  UserPropertyDto,
} from '@domain/user/dto/user.dto';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AreaRepository } from '@domain/user/repository/area.repository';
import { AccountService } from '@domain/account/service/account.service';
import { UserState } from '@domain/user/user.enum';
import * as nicknameSource from '@domain/user/resource/nickname.json';
import { getRandomItem } from '@common/util';
import { AgreementDTO } from '@domain/user/dto/user.dto';

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
    const user = await this.registerUser(dto.userProperty);

    await this.registerAgreements(user.id, dto.agreements);

    await this.registerArea(user.id, dto.areas);

    await this.accountService.register(user.id, dto.account);
    return user;
  }

  private async registerArea(userId: number, dtoList: AreaDto[]) {
    const areaParams = dtoList.map((dto) => {
      return {
        userId,
        order: 0,
        category: dto.category,
        address: dto.address,
        location: { latitude: dto.latitude, longitude: dto.longitude },
      };
    });
    await this.areaRepo.saveAreas(areaParams);
  }

  private async registerAgreements(userId: number, dtoList: AgreementDTO[]) {
    const params = dtoList.map((dto) => {
      return { userId, ...dto };
    });
    await this.agreementRepo.saveAgreements(params);
  }

  private async registerUser(dto: UserPropertyDto) {
    const nickname = this.getNickname();
    const user = await this.userRepo.saveUser({
      state: UserState.ACTIVE,
      nickname,
      property: dto,
    });
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
