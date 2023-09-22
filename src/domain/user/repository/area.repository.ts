import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AreaCategory } from '@domain/user/user.enum';
import { Prisma } from '@prisma/client';

@Injectable()
export class AreaRepository {
  constructor(private prisma: PrismaService) {}

  async saveArea(param: {
    userId: number;
    category: AreaCategory;
    order: number;
    address: string;
    location: { latitude: number; longitude: number };
  }) {
    await this.saveAreas([param]);
  }

  async saveAreas(
    params: {
      userId: number;
      category: AreaCategory;
      order: number;
      address: string;
      location: { latitude: number; longitude: number };
    }[],
  ) {
    const query = params.map(
      (param) =>
        Prisma.sql`(${param.userId}, ${param.category}, ${param.order}, ${
          param.address
        }, st_point(${param.location.latitude},${
          param.location.longitude
        }), ${new Date()})`,
    );
    await this.prisma.$queryRaw`
      INSERT INTO user_areas (user_id, category, "order", address, location, updated_at) 
      VALUES ${Prisma.join(query)}`;
  }

  async getAreasByUserId(userId: number) {
    const areas = await this.prisma.userAreas.findMany({ where: { userId } });

    return areas.map((area) => {
      const { category, ...res } = area;

      const enumCategory = {
        [AreaCategory.ACTIVITY_AREA]: AreaCategory.ACTIVITY_AREA,
        [AreaCategory.DINING_AREA]: AreaCategory.DINING_AREA,
      };
      const targetCategory: AreaCategory = enumCategory[category];
      return { ...res, category: targetCategory };
    });
  }
}
