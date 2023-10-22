import { AreaCategory } from '@domain/user/user.enum';
import { AreaEntity } from '@domain/user/repository/area.repository';
import { UserEntity } from '@domain/user/repository/user.repository';

export class EndUser {
  readonly id: number;
  readonly nickname: string;
  readonly state: string;
  readonly areas?: AreaEntity[];

  constructor(
    user: UserEntity,
    param?: {
      areas?: AreaEntity[];
    },
  ) {
    this.id = user.id;
    this.nickname = user.nickname;
    this.state = user.state;
    this.areas = param?.areas;
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
