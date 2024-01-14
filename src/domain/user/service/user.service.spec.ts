import { truncateTables } from '@root/jest.setup';
import {
  changeArea,
  createUser,
  createProfile,
  _private,
  searchProfile,
  changeUserState,
} from '@domain/user/service/user.service';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import {
  AgreementCategory,
  AreaCategory,
  UserState,
} from '@domain/user/user.enum';
import { AccountCategory } from '@domain/account/account.enum';
import prismaClient from '@common/database/prisma';
import { getProfile } from '@domain/user/facade/user.facade';

describe('user service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
      'users',
      'user_areas',
      'accounts',
      'authentications',
      'authentication_histories',
    ]);
  });

  const DTO: RegisterUserDTO = {
    userProperty: {},
    areas: [
      {
        latitude: 1,
        longitude: 1,
        category: AreaCategory.ACTIVITY_AREA,
        address: 'test',
      },
      {
        latitude: 1,
        longitude: 1,
        category: AreaCategory.DINING_AREA,
        address: 'test',
      },
    ],
    account: {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    },
    agreements: [
      {
        category: AgreementCategory.PERSONAL_INFORMATION,
        is_agree: true,
      },
    ],
  };

  it('should change user state', async () => {
    const user = await createProfile(DTO);
    const expected = UserState.WITHDRAWAL;
    await changeUserState(user.id, expected);

    const profile = await getProfile(user.id);
    expect(profile.user.state).toEqual(expected);
  });

  it('should change area', async () => {
    const user = await createProfile(DTO);
    await changeArea(user.id, {
      category: AreaCategory.ACTIVITY_AREA,
      address: 'update activity',
      latitude: 100,
      longitude: 1000,
    });

    const updatedUser = await searchProfile(user.id);
    expect(updatedUser.areas.activityArea?.address).toEqual('update activity');
  });

  it('should return user entity and essential field', async () => {
    const user = await createUser(DTO.userProperty);
    const profileEntity = await searchProfile(user.id);
    expect(profileEntity).toHaveProperty('user');
  });

  it('should create user and account and agreement and location', async () => {
    const user = await createProfile(DTO);

    expect(user).not.toBeNull();
    expect(user).toHaveProperty('state');
    expect(user).toHaveProperty('id');
  });

  describe('[private] ', () => {
    it('createUser should create user', async () => {
      const dto = {
        company: {
          authenticationId: 1,
          companyName: 'name',
          identification: 'ide',
          category: 'email' as const,
        },
      };
      const user = await _private.createUser(dto);
      expect(user).toHaveProperty('id');

      expect(user).toHaveProperty('property');
      const company = user.property;
      expect(company).toEqual({ companyName: dto.company.companyName });
    });

    it('createRandomNickname should return random nickname', () => {
      const nick = _private.createRandomNickname();
      expect(nick).not.toBeNull();
    });
  });
});
