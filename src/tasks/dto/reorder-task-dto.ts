import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class ReorderTasksDto {
  @ApiProperty({
    example: 10,
    description: 'Dragged task id',
  })
  @Type(() => Number)
  @IsInt()
  taskId!: number;

  @ApiProperty({
    example: 4,
    description: 'Target column id',
  })
  @Type(() => Number)
  @IsInt()
  targetColumnId!: number;

  @ApiProperty({
    example: [10, 12, 15],
    description: 'New task ordering',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  taskIds!: number[];
}
