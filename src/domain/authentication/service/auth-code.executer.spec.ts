import { AuthenticationCategory } from '../authentication.enum';
import { _private } from './auth-code.executer';

describe('executer', () => {
  describe('private', () => {
    it.each([[6, [2]]])('should return expected size code', (codeSize) => {
      const res = _private.createDigitCode(codeSize);
      expect(res.length).toEqual(codeSize);
    });

    it.each([
      [AuthenticationCategory.ACCOUNT, '계정인증'],
      [AuthenticationCategory.PASSWORD, '비밀번호변경'],
    ])('should return expected content', (category, expectedSubject) => {
      const res = _private.getEmailContentsForm(category, '123', 'ide');
      expect(res.subject).toEqual(expectedSubject);
    });
  });
});
