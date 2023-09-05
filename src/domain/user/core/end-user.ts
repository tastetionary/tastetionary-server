import { UserRepository } from '@domain/user/repository/user.repository';
import { UserState } from '@domain/user/user.enum';

export class EndUser {
  constructor(private readonly repo: UserRepository) {}
  async register() {
    const nickname = this.getNickname();
    return await this.repo.saveUser({
      state: UserState.ACTIVE,
      nickname,
      property: {},
    });
  }

  protected getNickname() {
    return 'random nickname';
  }
}
