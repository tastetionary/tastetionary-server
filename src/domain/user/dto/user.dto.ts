import typia from 'typia';
import { AgreementCategory, WithdrawalTypeEnum } from '@domain/user/user.enum';
import { CreateAccountRequest } from '@domain/account/dto/account.dto';
import { AreaEntity } from '@domain/user/service/user.service';

export const checkRegisterAccountDto = typia.createIs<RegisterProfileRequest>();

export interface WithdrawUserDto {
  /**
   * user data, not essential
   * @type WithdrawalTypeEnum
   */
  type: WithdrawalTypeEnum;
}

export interface PreferneceDto {
  /**
   * restaurant id
   * @type number
   */
  restaurantId: number;
}

export interface RegisterProfileRequest {
  /**
   * user data, not essential
   * @type Object
   */
  userProperty: UserPropertyDto;

  /**
   * user location data
   * @type AreaDto
   */
  areas: AreaDto;

  /**
   * account data
   * @type CreateAccountRequest
   */
  account: CreateAccountRequest;

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

  /**
   * string to identify unique, like email. it is coupled by category
   * @type string
   */
  identification: string;

  /**
   * identification category, available use: email
   * @type string
   */
  category: 'email';
}

export interface ProfileResponse {
  /**
   * userId
   * @type number
   */
  id: number;

  /**
   * user nickname created by server
   * example: google
   * @type string
   */
  nickname: string;

  /**
   * user area entity, two entity but activity area is optional
   * @type AreaEntity
   */
  area: AreaEntity;

  /**
   * user account email, company is optional, only return email,
   */
  account: {
    accountEmail: string;
    companyEmail: string | null;
  };
}
