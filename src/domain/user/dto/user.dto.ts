import typia from 'typia';
import { AccountCategory, AgreementCategory } from '@domain/user/user.enum';

export const checkRegisterAccountDto = typia.createIs<RegisterUserDTO>();

export interface RegisterUserDTO extends AccountDTO {
  /**
   * agreements data
   * @type Array
   */
  agreement: AgreementDTO[];
}

export interface AccountDTO {
  /**
   * unique identification for accounts, such as email
   * @type string
   */
  identification: string;

  /**
   * password for accounts, it should be one-way encrypted
   * @type string
   */
  password: string;

  /**
   * category for accounts, now only support 'EMAIL'
   * @type string
   */
  category: AccountCategory;
}

export interface AgreementDTO {
  /**
   * category for agreements, now only support 'PERSONAL_INFORMATION''
   * @type string
   */
  category: AgreementCategory;

  /**
   * whether user agree the agreement-category
   * @type boolean
   */
  is_agree: boolean;
}
