import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PositiveNumberPipe implements PipeTransform {
  transform(value: string) {
    const numberValue = Number(value);

    if (isNaN(numberValue) || numberValue <= 0) {
      throw new BadRequestException('Value must be a positive number');
    }

    return numberValue;
  }
}
