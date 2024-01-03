import { detachEmoji, isExpired } from '@common/util';

describe('util', () => {
  it.each([
    ['2022-01-01T00:00:00Z', '2023-01-01T00:00:00Z', true],
    ['2023-01-01T00:00:00Z', '2022-01-01T00:00:00Z', false],
    ['2022-01-01T00:00:00Z', '2022-01-01T00:00:00Z', true],
  ])(
    'returns %p if expiredAt is %p and standardTime is %p',
    (expiredAt, standardTime, expectRes) => {
      const result = isExpired(new Date(expiredAt), new Date(standardTime));
      expect(result).toBe(expectRes);
    },
  );

  it.each([
    ['분위기 좋아요🍷', ['분위기 좋아요']],
    ['친절해요💕', ['친절해요']],
    ['💕', ['']],
  ])('should return only word', (target, expected) => {
    const res = detachEmoji([target]);
    expect(res).toEqual(expected);
  });
});
