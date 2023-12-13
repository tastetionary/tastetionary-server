import {
  externalRestaurantInformationRecordFactory,
  restaurantReviewRecordFactory,
} from './restaurant.factory';

describe('restaurant', () => {
  it('should return data', () => {
    const res = externalRestaurantInformationRecordFactory({});
    expect(res).not.toBeNull();
  });
  it('should return data', () => {
    const res = restaurantReviewRecordFactory({ userId: 1 });
    expect(res).not.toBeNull();
  });
});
