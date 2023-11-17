import { ErrorCategoryEnum, ErrorNameEnum } from '@common/exception/enum';
import {
  BaseException,
  CallerWrongUsageException,
} from '@common/exception/internal.exception';

describe('exception', () => {
  it('should create caller error', () => {
    const error = new CallerWrongUsageException(
      ErrorNameEnum.INVALID_INPUT,
      'message',
      'hint',
      {
        userId: 'userId',
      },
    );

    expect(error.category).toBe(ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR);
    expect(error.hint).toBe('hint');
    expect(error.loggedData).toEqual({ userId: 'userId' });
  });

  it('should create error', () => {
    const error = new BaseException(
      ErrorCategoryEnum.CALLER_WRONG_DOMAIN_ERROR,
      ErrorNameEnum.INVALID_INPUT,
      'message',
      'hint',
      { userId: 'userId' },
    );

    expect(error).toBeDefined();
  });
});
