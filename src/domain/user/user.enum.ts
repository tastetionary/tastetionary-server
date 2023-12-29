export enum UserState {
  ACTIVE = 'active',
  WITHDRAWAL = 'withdrawal',
}

export enum AgreementCategory {
  PERSONAL_INFORMATION = 'personal_information',
}

export enum AreaCategory {
  ACTIVITY_AREA = 'activity_area',
  DINING_AREA = 'dining_area',
}

/**
 * enum 대신할 type literal 시험 삼아 사용
 */
export type OpinionCategory = 'withdrawal';

export enum AccountCancellationTypeEnum {
  /**
   * 사용성이 불편해요
   */
  INCONVENIENT_USAGE = 'inconvenient_usage',
  /**
   * 더이상 서비스가 필요없어요
   */
  NO_LONGER_NEED_SERVICE = 'no_longer_need_service',

  /**
   * 사용빈도가 낮아요
   */
  INFREQUENTLY_USE = 'infrequently_use',

  /**
   * 더 마음에 드는 비슷한 서비스를 찾았어요
   */
  FOUND_SIMILAR_SERVICE = 'found_similar_service',

  /**
   * 컨텐츠의 신뢰성이 떨어져요
   */
  LOW_RELIABILITY_CONTENTS = 'low_reliability_contents',

  /**
   * 개인정보를 삭제하고 싶어요
   */
  WANT_TO_DELETE_PERSONAL_INFORMATION = 'want_to_delete_personal_information',
}
