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
    externalRestaurantInformationId: number;
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
      externalRestaurantInformationId: number;
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
    const query = Prisma.sql`INSERT INTO external_restaurant_informations (external_uuid, name, location, reference_link, updated_at) 
        VALUES (${param.externalUUID}, ${param.name}, st_point(${
      param.location.latitude
    }, ${param.location.longitude}), ${param.referenceLink}, ${new Date()})`;
    await this.prisma.$queryRaw`${query}`;
  }

  async getExternalRestaurantInformation(externalUUid: bigint) {
    return this.prisma.externalRestaurantInformations.findFirst({
      where: { external_uuid: externalUUid },
    });
  }
}
