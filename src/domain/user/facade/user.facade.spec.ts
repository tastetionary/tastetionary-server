import { AccountCategory } from '@domain/account/account.enum';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import {
  WithdrawalTypeEnum,
  AgreementCategory,
  AreaCategory,
  UserState,
} from '@domain/user/user.enum';
import {
  getProfile,
  registerProfile,
  withdrawProfile,
} from '@domain/user/facade/user.facade';
import {
  changeAuthenticationAsDone,
  createProgressAuthentication,
  getAuthentication,
} from '@domain/authentication/service/authentication.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

describe('user facade', () => {
  it('withdrawFrom should update state ', async () => {
    const dto: RegisterUserDTO = {
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
        authenticationId: 1,
        identification: `test_${new Date().getMilliseconds()}`,
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

    const user = await registerProfile(dto);

    await withdrawProfile(user.id, WithdrawalTypeEnum.FOUND_SIMILAR_SERVICE);

    const profile = await getProfile(user.id);
    expect(profile.user.state).toEqual(UserState.WITHDRAWAL);
  });

  it('registerProfile should create profile and auth list', async () => {
    const createIde = (category: string) =>
      `${category}_${new Date().getMilliseconds()}`;

    const com = createIde('company');
    const acc = createIde('account');
    const res = await createProgressAuthentication({
      identification: com,
      category: AuthenticationCategory.COMPANY,
      type: AuthenticationType.EMAIL,
      code: '1234',
    });
    await changeAuthenticationAsDone(res.id, '1234');

    const accRes = await createProgressAuthentication({
      identification: acc,
      category: AuthenticationCategory.ACCOUNT,
      type: AuthenticationType.EMAIL,
      code: '1234',
    });
    await changeAuthenticationAsDone(accRes.id, '1234');

    const dto: RegisterUserDTO = {
      userProperty: {
        company: {
          authenticationId: res.id,
          companyName: 'test',
          identification: com,
          category: 'email',
        },
      },
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
        identification: acc,
        password: 'pwd',
        category: AccountCategory.EMAIL,
        authenticationId: accRes.id,
      },
      agreements: [
        {
          category: AgreementCategory.PERSONAL_INFORMATION,
          is_agree: true,
        },
      ],
    };

    const user = await registerProfile(dto);

    const profile = await getProfile(user.id);
    expect(profile).not.toBeNull();

    const auth = await getAuthentication(
      com,
      AuthenticationCategory.COMPANY,
      AuthenticationType.EMAIL,
    );
    expect(auth?.userId).toEqual(user.id);
  });
});
