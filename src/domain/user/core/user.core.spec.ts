import { UserCore } from './user.core';

describe('user core', () => {
  it('should return', () => {
    const user = new UserCore();
    expect(user.helloWorld()).toEqual('hello');
  });
});
