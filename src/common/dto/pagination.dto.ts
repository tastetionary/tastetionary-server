import { BaseResponseArgs, BaseResponseDto } from '@src/common/dto/base.dto';
import { IsOptional } from 'class-validator';

export class PageRequestDto {
  @IsOptional()
  offset?: number = 0;

  @IsOptional()
  limit?: number = 10;
}

interface PageResponseArgs extends BaseResponseArgs {
  offset: number;
  limit: number;
  totalCount?: number;
}

export class PageResponseDto<T> extends BaseResponseDto<T> {
  offset: number;
  limit: number;
  totalCount?: number;

  public constructor(args: PageResponseArgs) {
    super(args);
    const { offset, limit, totalCount } = args;
    this.offset = Number.isNaN(offset) ? 0 : Number(offset);
    this.limit = Number.isNaN(limit) ? 0 : Number(limit);
    this.totalCount = totalCount;
  }
}
