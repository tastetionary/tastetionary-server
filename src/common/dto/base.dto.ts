export class BaseResponseDto<T> {
  data: T;

  public constructor(data: T) {
    this.data = data;
  }
}
