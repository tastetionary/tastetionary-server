import { EmptyContentDto } from '@domain/domain.dto';

export function isEmptyContentDto(obj: any): obj is EmptyContentDto {
  return obj && obj.message;
}

export function getRandomItem<T>(items: Array<T>): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function detachEmoji(words: string[]) {
  return words.map((word) => {
    return word.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      '',
    );
  });
}
