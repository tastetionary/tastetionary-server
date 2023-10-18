import typia from 'typia';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { AccountDTO } from '@domain/account/dto/account.dto';

export const checkRegisterAccountDto = typia.createIs<RegisterUserDTO>();

export interface RegisterUserDTO {
  /**
   * user data, not essential
   * @type Object
   */
  userProperty: UserPropertyDto;

  /**
   * user location data, now only support 'ACTIVITY_AREA' and 'DINING_AREA'
   * @type AreaDto[]
   */
  areas: AreaDto[];

  /**
   * account data
   * @type Object
   */
  account: AccountDTO;

  /**
   * agreements data
   * @type AgreementDTO[]
   */
  agreements: AgreementDTO[];
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

export interface AreaDto {
  /**
   * area category
   * example: 'dining_area'
   * @type AreaCategory
   */
  category: AreaCategory;

  /**
   * human-readable address,
   * example: '서울특별시 강남구 00동'
   * @type string
   */
  address: string;

  /**
   * latitude,
   * example: 37.1234
   * @type number
   */
  latitude: number;

  /**
   * longitude,
   * example: 127.1123
   * @type number
   */
  longitude: number;
}

export interface UserPropertyDto {
  /**
   * company data, not essential, when user authenticate with company
   * @type CompanyDto
   */
  companyData?: CompanyDto;
}

export interface CompanyDto {
  /**
   * authentication id which is done
   * @type number
   */
  authenticationId: number;

  /**
   * company name, it will come with company authentication
   * example: google
   * @type string
   */
  companyName: string;
}
