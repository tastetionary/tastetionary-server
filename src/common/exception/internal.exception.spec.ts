import { ErrorCategory } from '@common/exception/enum';
import {
  BaseException,
  CallerWrongUsageException,
} from '@root/src/common/exception/internal.exception';

describe('exception', () => {
  it('should create caller error', () => {
    const error = new CallerWrongUsageException('type', 'message', 'hint', {
      userId: 'userId',
    });

    expect(error.category).toBe(ErrorCategory.CALLER_WRONG_USAGE_ERROR);
    expect(error.hint).toBe('hint');
    expect(error.loggedData).toEqual({ userId: 'userId' });
  });

  it('should create error', () => {
    const error = new BaseException(
      ErrorCategory.CALLER_WRONG_DOMAIN_ERROR,
      'type',
      'message',
      'hint',
      { userId: 'userId' },
    );

    expect(error).toBeDefined();
  });
});
