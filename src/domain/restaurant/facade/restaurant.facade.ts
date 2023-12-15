import {
  createReview,
  getSearchOptions,
} from '@domain/restaurant/service/restaurant.service';
import { ErrorNameEnum } from '@common/exception/enum';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import { searchAreas } from '@domain/user/service/user.service';
import {
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';

export function getFilterOptions() {
  return getSearchOptions();
}

export async function registerReview(param: {
  userId: number;
  externalDto: ExternalRestaurantInformationDTO;
  dto: RestaurantReviewDTO;
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas.activityArea) {
    throw new CallerWrongDomainRuleException(
      ErrorNameEnum.NO_DATA,
      'can not register review, should register activity area',
    );
  }

  await createReview(param);
}
