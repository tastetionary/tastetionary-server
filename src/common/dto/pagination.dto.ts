import { IsInt, IsOptional, Min } from 'class-validator';
import { BaseResponseDto } from './base.dto';

export class PageRequestParams {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

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
