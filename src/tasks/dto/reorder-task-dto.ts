import { Type } from 'class-transformer';
import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';

export class ReorderTasksDto {
  @Type(() => Number)
  @IsInt()
  taskId!: number;

  @Type(() => Number)
  @IsInt()
  targetColumnId!: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  taskIds!: number[];
}
