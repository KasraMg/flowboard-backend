import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class ReorderColumnsDto {
  @ApiProperty({
    example: [3, 1, 2],
    description: 'Ordered column ids',
  })
  @IsArray()
  @IsInt({ each: true })
  columnIds!: number[];
}
