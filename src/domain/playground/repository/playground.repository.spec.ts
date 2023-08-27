import { PlaygroundRepository } from '@domain/playground/repository/playground.repository';

describe('playground repository', () => {
  it('should return get', () => {
    const repo = new PlaygroundRepository();
    expect(repo.get(2)).not.toBeNull();
  });
});
