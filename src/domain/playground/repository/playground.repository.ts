import { Injectable } from '@nestjs/common';
import { RepositoryException } from '@common/exception/custom.exception';

@Injectable()
export class PlaygroundRepository {
  get(num: number) {
    if (num == 1) {
      throw new RepositoryException('reason', 'how to resolve', {
        some: 'detail',
      });
    }
    return num;
  }
}
