import { BaseResponseDto } from './base.dto';

export class PageResponseDto<T> extends BaseResponseDto<T> {
  limit: number;
  totalCount: number;
  totalPages: number;

  public constructor(data: T, limit: number, totalCount: number) {
    super(data);
    this.limit = limit;
    this.totalPages = Math.ceil(totalCount / limit);
    this.totalCount = totalCount;
  }
}
