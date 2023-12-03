import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import {
  registerUser,
  UserService,
  _private,
} from '@domain/user/service/user.service';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { UserModule } from '@domain/user/user.module';
import { AccountModule } from '@domain/account/account.module';
import { AccountCategory } from '@domain/account/account.enum';
import { AuthenticationService } from '@domain/authentication/service/authentication.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import * as brevo from '@thirdParty/brevo/brevo';
import prismaClient from '@common/database/new.prisma';

describe('user service', () => {
  let service: UserService;
  let module: TestingModule;
  let authenticationService: AuthenticationService;

  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [UserModule, AccountModule],
    )) as TestingModule;
    service = module.get(UserService);
    authenticationService = module.get(AuthenticationService);
  });

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

  it('update area should update', async () => {
    const user = await service.register(DTO);
    await service.updateArea(user.id, {
      category: AreaCategory.ACTIVITY_AREA,
      address: 'update activity',
      latitude: 100,
      longitude: 1000,
    });

    const updatedUser = await service.getEndUser(user.id);
    expect(updatedUser.activityArea?.address).toEqual('update activity');
  });

  it('with company data should update company authentication', async () => {
    const tempMock = jest.spyOn(brevo, 'sendEmail');
    tempMock.mockResolvedValue(Promise.resolve(true));
    const authData = {
      category: AuthenticationCategory.COMPANY,
      identification: 'user-service@crud.com',
      type: AuthenticationType.EMAIL,
    };
    const res = await authenticationService.createProgressAuthentication(
      authData,
    );
    const { id: authId } =
      await authenticationService.doneProgressAuthentication(res.id, '000000');

    const deepCopiedData = JSON.parse(JSON.stringify(DTO));
    deepCopiedData.userProperty.companyData = {
      companyName: 'test',
      authenticationId: authId,
    };
    const user = await service.register(deepCopiedData);

    const userAuth = await authenticationService.getUserAuth(authData);
    const auth = userAuth.getAuth(authData.identification, authData.category);
    expect(auth?.userId).toEqual(user.id);
  });

  it('should return end-user', async () => {
    const user = await service.register(DTO);
    const endUser = await service.getEndUser(user.id);
    expect(endUser).not.toBeNull();
    expect(endUser.activityArea).not.toBeNull();
  });

  it('should create user and account and agreement and location', async () => {
    const user = await service.register(DTO);
    expect(user).not.toBeNull();
  });

  it('should create user and account and agreement and location', async () => {
    const user = await registerUser(DTO);
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('state');
    expect(user).toHaveProperty('id');
  });

  describe('[private] ', () => {
    it('createUser with company data should update user property', async () => {
      const dto = {
        companyData: { authenticationId: 1, companyName: 'name' },
      };
      const res = await _private.createUser(dto);
      expect(res).toHaveProperty('id');
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
