export interface BaseResponseArgs {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export class BaseResponseDto<T> {
  data: T;

  public constructor(args: BaseResponseArgs) {
    const { data } = args;
    this.data = data;
  }
}
