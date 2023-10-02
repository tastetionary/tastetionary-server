import { AreaCategory } from '@domain/user/user.enum';
import { AreaEntity } from '@domain/user/repository/area.repository';

export class EndUser {
  readonly id: number;
  readonly areas?: AreaEntity[];

  constructor(id: number, areas?: AreaEntity[]) {
    this.id = id;
    this.areas = areas;
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
