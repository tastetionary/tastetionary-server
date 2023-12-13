import {
  externalRestaurantInformationEntityFactory,
  restaurantReviewEntityFactory,
} from './restaurant.factory';

describe('restaurant', () => {
  it('should return data', () => {
    const res = externalRestaurantInformationEntityFactory({});
    expect(res).not.toBeNull();
  });
  it('should return data', () => {
    const res = restaurantReviewEntityFactory({ userId: 1 });
    expect(res).not.toBeNull();
  });
});
