import typia from 'typia';
import { AccountCategory } from '../user.enum';
export const checkRegisterAccountDto = typia.createIs<RegisterAccountDto>();

export interface RegisterAccountDto {
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

  /**
   * agreements data
   * @type Array
   */
  agreement: RegisterAgreementDto[];
}

export interface RegisterAgreementDto {
  /**
   * category for agreements, now only support 'PERSONAL_INFORMATION''
   * @type string
   */
  category: string;

  /**
   * whether user agree the agreement-category
   * @type boolean
   */
  is_agree: boolean;
}
