import { truncateTables } from '@root/jest.setup';
import {
  changeArea,
  createUser,
  createProfile,
  _private,
  searchProfile,
  changeUserState,
} from '@domain/user/service/user.service';
import { RegisterProfileRequest } from '@domain/user/dto/user.dto';
import { AgreementCategory, UserState } from '@domain/user/user.enum';
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

  const DTO: RegisterProfileRequest = {
    nickname: 'nickname',
    area: {
      latitude: 1,
      longitude: 1,
      address: 'test',
    },
    account: {
      authenticationId: 1,
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
      address: 'update activity',
      latitude: 100,
      longitude: 1000,
    });

    const updatedUser = await searchProfile(user.id);
    expect(updatedUser.area?.address).toEqual('update activity');
  });

  it('should return user entity and essential field', async () => {
    const user = await createUser(DTO.nickname);
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
      const nickname = 'nickname';
      const user = await _private.createUser(nickname);
      expect(user).toHaveProperty('id');
    });

    it('createRandomNickname should return random nickname', () => {
      const nick = _private.createRandomNickname();
      expect(nick).not.toBeNull();
    });
  });
});
