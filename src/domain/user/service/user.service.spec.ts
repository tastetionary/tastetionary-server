import { truncateTables } from '@root/jest.setup';
import {
  changeArea,
  getProfileLegacy,
  registerUser,
  searchProfile,
  _private,
} from '@domain/user/service/user.service';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { AccountCategory } from '@domain/account/account.enum';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import prismaClient from '@root/src/common/database/prisma';
import { saveAuthentication } from '@domain/authentication/repository/authentication.repository';

describe('user service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
      'users',
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

  it('should change area', async () => {
    const user = await registerUser(DTO);
    await changeArea(user.id, {
      category: AreaCategory.ACTIVITY_AREA,
      address: 'update activity',
      latitude: 100,
      longitude: 1000,
    });

    const updatedUser = await getProfileLegacy(user.id);
    expect(updatedUser.activityArea?.address).toEqual('update activity');
  });

  it('should return user entity and essential field', async () => {
    const user = await registerUser(DTO);
    const profileEntity = await searchProfile(user.id);
    expect(profileEntity).toHaveProperty('user');
    expect(profileEntity).toHaveProperty('areas');
    expect(profileEntity).toHaveProperty('authList');
  });

  it('should create user and account and agreement and location', async () => {
    const user = await registerUser(DTO);
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('state');
    expect(user).toHaveProperty('id');
  });

  describe('[private] ', () => {
    it('changeCompany should update auth and user property', async () => {
      const user = await _private.createUser({});
      const auth = await saveAuthentication({
        identification: '',
        category: AuthenticationCategory.COMPANY,
        type: AuthenticationType.EMAIL,
        state: AuthenticationState.INPROGRESS,
      });
      const dto = {
        companyData: { authenticationId: auth.id, companyName: 'name' },
      };
      const updatedUser = await _private.changeCompany(
        user.id,
        dto.companyData,
      );
      expect(updatedUser).toHaveProperty('property');
      const company = updatedUser.property;
      expect(company).toEqual({ companyName: dto.companyData.companyName });
    });

    it('createUser should create user', async () => {
      const dto = {};
      const res = await _private.createUser(dto);
      expect(res).toHaveProperty('id');
    });

    it('createRandomNickname should return random nickname', () => {
      const nick = _private.createRandomNickname();
      expect(nick).not.toBeNull();
    });
  });
});
