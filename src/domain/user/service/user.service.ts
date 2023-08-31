import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/repository/user.repository';
import { UserCore } from '../core/user.core';

@Injectable()
export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUsers(param: {
    nickname: string;
    state: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>;
  }) {
    const user = new UserCore();
    console.log(user);
    return this.userRepo.saveUser(param);
  }
}
