import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewRepository {
  constructor(private prisma: PrismaService) {}

  async saveReview(param: {
    userId: number;
    keywords: string[];
    category: string;
    price: number;
    summary: string;
    opinion: string;
    external_restaurant_information_id: number;
  }) {
    this.saveReviews([param]);
  }

  async saveReviews(
    params: {
      userId: number;
      keywords: string[];
      category: string;
      price: number;
      summary: string;
      opinion: string;
      external_restaurant_information_id: number;
    }[],
  ) {
    this.prisma.restaurantReviews.createMany({ data: params });
  }

  async getReviewsByUserId(userId: number) {
    return this.prisma.restaurantReviews.findMany({ where: { userId } });
  }

  async saveExternalRestaurantInformation(param: {
    external_uuid: number;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    link: string;
  }) {
    const query = Prisma.sql`INSERT INTO external_restaurant_informations (external_uuid, name, location, link) 
        VALUES (${param.external_uuid}, ${param.name}, st_point(${param.location.latitude}, ${param.location.longitude}), ${param.link})`;
    await this.prisma.$queryRaw`${query}`;
  }

  async getExternalRestaurantInformation(externalUUid: number) {
    return this.prisma.externalRestaurantInformations.findFirst({
      where: { external_uuid: externalUUid },
    });
  }
}
