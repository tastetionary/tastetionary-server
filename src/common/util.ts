import emojiRegex from 'emoji-regex';

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
