import { detachEmoji } from '@common/util';

describe('util', () => {
  it.each([
    ['분위기 좋아요🍷', ['분위기 좋아요']],
    ['친절해요💕', ['친절해요']],
    ['💕', ['']],
  ])('should return only word', (target, expected) => {
    const res = detachEmoji([target]);
    console.log(res);
    expect(res).toEqual(expected);
  });
});
