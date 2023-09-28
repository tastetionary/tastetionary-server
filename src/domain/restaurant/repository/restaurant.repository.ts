import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { Prisma } from '@prisma/client';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';

@Injectable()
export class RestaurantRepository {
  constructor(private prisma: PrismaService) {}

  async saveReview(param: {
    userId: number;
    keywords: string[];
    category: RestaurantCategory;
    price: number;
    summary: string;
    opinion?: string;
    externalRestaurantInformationId: bigint;
  }) {
    await this.saveReviews([param]);
  }

  async saveReviews(
    params: {
      userId: number;
      keywords: string[];
      category: RestaurantCategory;
      price: number;
      summary: string;
      opinion?: string;
      externalRestaurantInformationId: bigint;
    }[],
  ) {
    const data: any[] = params.map((param) => {
      const { externalRestaurantInformationId, ...rest } = param;
      rest['external_restaurant_information_id'] =
        externalRestaurantInformationId;
      return rest;
    });
    await this.prisma.restaurantReviews.createMany({ data });
  }

  async getReviewsByUserId(userId: number) {
    return this.prisma.restaurantReviews.findMany({ where: { userId } });
  }

  async saveExternalRestaurantInformation(param: {
    externalUUID: bigint;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    referenceLink?: string;
  }) {
    await this.saveExternalRestaurantInformations([param]);
  }

  async saveExternalRestaurantInformations(
    param: {
      externalUUID: bigint;
      name: string;
      location: {
        latitude: number;
        longitude: number;
      };
      referenceLink?: string;
    }[],
  ) {
    const values = param.map(
      (param) =>
        Prisma.sql`(${param.externalUUID}, ${param.name}, 
        st_point(${param.location.latitude},${param.location.longitude}), 
        ${param.referenceLink},
        ${new Date()})`,
    );
    await this.prisma.$queryRaw`
      INSERT INTO external_restaurant_informations (external_uuid, name, location, reference_link, updated_at) 
      VALUES ${Prisma.join(values)}`;
  }

  async getExternalRestaurantInformation(externalUUid: bigint) {
    return this.prisma.externalRestaurantInformations.findFirst({
      where: { external_uuid: externalUUid },
    });
  }

  async getExternalRestaurantIdsByDistance(param: {
    latitude: number;
    longitude: number;
    maxDistanceOnMeter?: number;
  }): Promise<
    {
      id: bigint;
      name: string;
      external_uuid: bigint;
    }[]
  > {
    const queryRaw = Prisma.sql`
    SELECT id, name, external_uuid FROM external_restaurant_informations 
      WHERE st_dwithin(location, ST_MakePoint(${param.latitude}, ${param.longitude}), ${param.maxDistanceOnMeter})`;

    return await this.prisma.$queryRaw(queryRaw);
  }
}
