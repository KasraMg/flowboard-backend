import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Value must be string');
    }

    return value.trim();
  }
}
