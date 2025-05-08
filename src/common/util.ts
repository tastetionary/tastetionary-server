import emojiRegex from 'emoji-regex';
import { BadRequestException } from '@nestjs/common';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_CONTENT_LENGTH = 300;
export const ValidationMessages = {
  invalidImageType:
    '지원하지 않는 이미지 형식입니다. JPG, PNG, HEIC 형식만 가능합니다.',
  imageTooLarge: '이미지 크기는 5MB를 초과할 수 없습니다.',
  invalidFileName: '파일 이름에 특수문자를 사용할 수 없습니다.',
  invalidExtension: '지원하지 않는 파일 확장자입니다.',
  contentTooLong: (max: number) => `내용은 ${max}자를 초과할 수 없습니다.`,
  invalidContentChars: '내용에 특수문자를 사용할 수 없습니다.',
};

export function getRandomItem<T>(items: Array<T>): T {
  return items[Math.floor(Math.random() * items.length)];
}
export function detachEmoji(words: string[]) {
  const unicodeEmojiRegex = emojiRegex();
  const namedEmojiRegex = /:\w+:/g;

  return words.map((word) => {
    return word.replace(unicodeEmojiRegex, '').replace(namedEmojiRegex, '');
  });
}

export function isExpired(expiredAt: Date, standardTime?: Date): boolean {
  const currentTime = standardTime ?? new Date();
  return expiredAt.getTime() <= currentTime.getTime();
}

export function validateImageFile(file: Express.Multer.File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new BadRequestException(ValidationMessages.invalidImageType);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new BadRequestException(ValidationMessages.imageTooLarge);
  }

  const fileName = file.originalname;
  if (!/^[a-zA-Z0-9가-힣\s\-_.]+$/.test(fileName)) {
    throw new BadRequestException(ValidationMessages.invalidFileName);
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'heic'].includes(ext || '')) {
    throw new BadRequestException(ValidationMessages.invalidExtension);
  }
}

export function validateContent(content: string) {
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new BadRequestException(
      ValidationMessages.contentTooLong(MAX_CONTENT_LENGTH),
    );
  }

  const dangerousPattern = /[<>{}[\]\\]/;
  if (dangerousPattern.test(content)) {
    throw new BadRequestException(ValidationMessages.invalidContentChars);
  }
}
