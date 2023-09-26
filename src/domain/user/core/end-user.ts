import { AreaCategory } from '@domain/user/user.enum';

interface AreaEntity {
  id: number;
  userId: number;
  category: AreaCategory;
  order: number;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class EndUser {
  readonly id: number;
  readonly areas?: AreaEntity[];
  constructor(id: number, areas?: AreaEntity[]) {
    this.id = id;
    this.areas = areas;
  }

  get activityArea() {
    return this.getArea(AreaCategory.ACTIVITY_AREA);
  }

  private getArea(category: AreaCategory) {
    return this.areas?.find((area) => area.category === category);
  }
}
