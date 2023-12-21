import { AuthenticationCategory } from '../authentication.enum';
import { _private } from './auth-code.executer';

describe('executer', () => {
  describe('private getContents', () => {
    it.each([
      [AuthenticationCategory.ACCOUNT, '계정인증'],
      [AuthenticationCategory.COMPANY, '회사인증'],
    ])('should return content', (category, expectedSubject) => {
      const res = _private.getContents(category, '123', 'ide');

      expect(res.subject).toEqual(expectedSubject);
    });
  });
});
