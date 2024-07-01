export enum RestaurantCategory {
  ALL = '전체',
  KOREAN = '한식',
  CHINESE = '중식',
  WESTERN = '양식',
  JAPANESE = '일식',
  FAST_FOOD = '패스트푸드',
  SNACK = '분식',
  ASIAN = '아시아식',
  BUFFET = '뷔페',
  SALAD = '샐러드',
  CAFE_AND_DESERT = '카페/디저트',
}

export enum RestaurantKeyword {
  ALL = '전체',
  TASTE = '맛있어요',
  CLEAN = '깨끗해요',
  KIND = '친절해요',
  ATMOSPHERE = '분위기 좋아요',
  CHEAP = '가성비 좋아요',
  PARKING = '주차 가능해요',
  ROTATION = '회전율 좋아요',
  LARGE = '양이 많아요',
  WIDE = '넓고 쾌적해요️',
  WAITING = '웨이팅 있어요',
}

export enum RestaurantPrice {
  UNDER_10000 = '~10,000원',
  UNDER_11000 = '~11,000원',
  UNDER_12000 = '~12,000원',
  UNDER_13000 = '~13,000원',
  OVER_13000 = '13,000원~',
}

export const RestaurantCategoryIcons: Record<RestaurantCategory, string> = {
  [RestaurantCategory.ALL]: 'menu_all',
  [RestaurantCategory.KOREAN]: 'menu_korean',
  [RestaurantCategory.CHINESE]: 'menu_chinese',
  [RestaurantCategory.WESTERN]: 'menu_western',
  [RestaurantCategory.JAPANESE]: 'menu_japanese',
  [RestaurantCategory.FAST_FOOD]: 'menu_fastfood',
  [RestaurantCategory.SNACK]: 'menu_snack',
  [RestaurantCategory.ASIAN]: 'menu_asian',
  [RestaurantCategory.BUFFET]: 'menu_buffet',
  [RestaurantCategory.SALAD]: 'menu_salad',
  [RestaurantCategory.CAFE_AND_DESERT]: 'menu_cafedessert',
};

export const RestaurantKeywordEmoji: Record<RestaurantKeyword, string> = {
  [RestaurantKeyword.ALL]: '',
  [RestaurantKeyword.TASTE]: '👅',
  [RestaurantKeyword.CLEAN]: '✨',
  [RestaurantKeyword.KIND]: '💕',
  [RestaurantKeyword.ATMOSPHERE]: '🍷',
  [RestaurantKeyword.CHEAP]: '👍',
  [RestaurantKeyword.PARKING]: '🚘',
  [RestaurantKeyword.ROTATION]: '⏩',
  [RestaurantKeyword.LARGE]: '🥰',
  [RestaurantKeyword.WIDE]: '🎶',
  [RestaurantKeyword.WAITING]: '💦',
};

export enum ReviewReportCategory {
  INAPPROPRIATE_CONTENT = '부적절한 내용',
  SPAM = '스팸',
  HATE_SPEECH = '혐오 발언',
  ADVERTISEMENT = '광고',
  FALSE_INFO = '허위 정보',
  ETC = '기타',
}
