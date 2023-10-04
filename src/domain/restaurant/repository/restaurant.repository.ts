import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { Prisma } from '@prisma/client';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';

export interface RestaurantReviewEntity {
  id: number;
  external_restaurant_information_id: bigint;
  userId: number;
  category: RestaurantCategory;
  summary: string;
  opinion: string | null;
  keywords: string[];
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExternalRestaurantInformationEntity {
  id: bigint;
  name: string;
  externalUUID: bigint;
  referenceLink: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

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
        st_point(${param.location.longitude},${param.location.latitude}), 
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

  async getReviewsByConditions(param: {
    restaurantIds?: bigint[];
    keywords?: string[];
    ltePrice?: number;
    categories?: RestaurantCategory[];
  }): Promise<RestaurantReviewEntity[]> {
    const condition = {};

    if (param.restaurantIds && param.restaurantIds.length >= 1) {
      condition['external_restaurant_information_id'] = {
        in: param.restaurantIds,
      };
    }

    if (param.keywords && param.keywords.length >= 1) {
      condition['keywords'] = { hasSome: param.keywords };
    }

    if (param.ltePrice) {
      condition['price'] = { lte: param.ltePrice };
    }

    if (param.categories) {
      condition['category'] = {
        in: param.categories,
      };
    }

    const res = await this.prisma.restaurantReviews.findMany({
      where: condition,
    });

    return res.map((r) => {
      const { category, ...rest } = r;
      const enumCategory = Object.values(RestaurantCategory).find(
        (key) => key == category,
      ) as RestaurantCategory;

      return { ...rest, category: enumCategory };
    });
  }

  async getExternalRestaurantIdsByDistance(param: {
    latitude: number;
    longitude: number;
    maxDistanceMeter?: number;
    excludedIds?: bigint[];
  }): Promise<ExternalRestaurantInformationEntity[]> {
    const excludedIds =
      param.excludedIds?.length != 0 ? (param.excludedIds as bigint[]) : [0n];

    const queryRaw = Prisma.sql`
      SELECT id, 
          name, 
          external_uuid as "externalUUID", 
          reference_link as "referenceLink",
          ST_Y(location::geometry) as latitude,
          ST_X(location::geometry) as longitude, 
          ST_Distance(location, ST_MakePoint(${param.longitude}, ${
      param.latitude
    })) as distance
      FROM external_restaurant_informations 
        WHERE id NOT IN (${Prisma.join(excludedIds)})
        AND st_dwithin(location, ST_MakePoint(${param.longitude}, ${
      param.latitude
    }), ${param.maxDistanceMeter})`;

    return await this.prisma.$queryRaw(queryRaw);
  }
}
