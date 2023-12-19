import { AccountCategory } from '@domain/account/account.enum';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { getProfile, registerProfile } from '@domain/user/facade/user.facade';

describe('user facade', () => {
  it('registerProfile should create profile', async () => {
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
    const profile = await getProfile(user.id);

    expect(profile).not.toBeNull();
  });
});
