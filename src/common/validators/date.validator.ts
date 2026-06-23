import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidDateFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(value)) {
            return false;
          }

          const date = new Date(value);
          const year = parseInt(value.substring(0, 4));
          const month = parseInt(value.substring(5, 7));
          const day = parseInt(value.substring(8, 10));

          return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day &&
            date.getTime() > 0
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}는 유효한 YYYY-MM-DD 형식이어야 합니다. (예: 2025-01-15)`;
        },
      },
    });
  };
}
