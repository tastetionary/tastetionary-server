import { AccountCategory } from '@domain/account/account.enum';
import { RegisterProfileRequest } from '@domain/user/dto/user.dto';
import {
  WithdrawalTypeEnum,
  AgreementCategory,
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
    const identification = `test_${new Date().getMilliseconds()}`;
    const accAuth = await createProgressAuthentication({
      identification,
      category: AuthenticationCategory.ACCOUNT,
      type: AuthenticationType.EMAIL,
      code: '1234',
    });
    const accAuthId = (await changeAuthenticationAsDone(accAuth.id, '1234')).id;
    const dto: RegisterProfileRequest = {
      nickname: 'nickname',
      areas: {
        latitude: 1,
        longitude: 1,
        address: 'test',
      },

      account: {
        authenticationId: accAuthId,
        identification,
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
    const acc = createIde('account');
    const accAuth = await createProgressAuthentication({
      identification: acc,
      category: AuthenticationCategory.ACCOUNT,
      type: AuthenticationType.EMAIL,
      code: '1234',
    });
    const accAuthId = (await changeAuthenticationAsDone(accAuth.id, '1234')).id;

    const dto: RegisterProfileRequest = {
      nickname: 'nickname',
      areas: {
        latitude: 1,
        longitude: 1,
        address: 'test',
      },
      account: {
        identification: acc,
        password: 'pwd',
        category: AccountCategory.EMAIL,
        authenticationId: accAuthId,
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
  });
});
