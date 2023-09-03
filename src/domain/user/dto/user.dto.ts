import typia from 'typia';
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
}
