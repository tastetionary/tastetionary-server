import { Injectable } from '@nestjs/common';
import { PlaygroundCore } from '@domain/playground/core/playground.core';

@Injectable()
export class PlaygroundService {
  constructor(private core: PlaygroundCore) {}

  get(num: number) {
    return this.core.get(num);
  }
}
