export interface BaseResponseArgs {
  code?: number;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export class BaseResponseDto<T> {
  code: number;
  message: string;
  data: T;

  public constructor(args: BaseResponseArgs) {
    const { code, message = 'SUCCESS', data } = args;
    this.code = code;
    this.message = message;
    this.data = data;
  }
}
