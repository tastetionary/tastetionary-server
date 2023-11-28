import { AreaCategory } from '@domain/user/user.enum';
import { AreaEntity } from '@domain/user/repository/area.repository';
import { UserEntity } from '@domain/user/repository/user.repository';
import { AuthenticationEntity } from '@domain/authentication/repository/authentication.repository';
import { AuthenticationCategory } from '@domain/authentication/authentication.enum';

export class EndUser {
  readonly id: number;
  readonly nickname: string;
  readonly state: string;
  readonly areas?: AreaEntity[];
  readonly authentications?: AuthenticationEntity[];

  constructor(
    user: UserEntity,
    param?: {
      areas?: AreaEntity[];
      authentications?: AuthenticationEntity[];
    },
  ) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.state = user.state;
    this.areas = param?.areas;
    this.authentications = param?.authentications;
  }

  get companyEmail() {
    return this.getAuthenticationEmail(AuthenticationCategory.COMPANY);
  }

  get accountEmail() {
    return this.getAuthenticationEmail(AuthenticationCategory.ACCOUNT);
  }

  private getAuthenticationEmail(category: AuthenticationCategory) {
    return this.authentications?.find((auth) => auth.category === category);
  }

  get dinningArea() {
    return this.getArea(AreaCategory.DINING_AREA);
  }

  get activityArea() {
    return this.getArea(AreaCategory.ACTIVITY_AREA);
  }

  private getArea(category: AreaCategory) {
    return this.areas?.find((area) => area.category === category);
  }
}
