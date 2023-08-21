import { PlaygroundRepository } from '@domain/playground/repository/playground.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlaygroundCore {
  constructor(readonly repo: PlaygroundRepository) {}
  get(num: number) {
    return this.repo.get(num);
  }
}
