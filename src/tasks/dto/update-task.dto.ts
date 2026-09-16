import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsHexColor,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../entities/task.entity';
import { Type } from 'class-transformer';

class TaskLabelDto {
  @ApiPropertyOptional({
    example: 'Frontend',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    example: '#3b82f6',
  })
  @IsString()
  @IsHexColor()
  backgroundColor!: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({
    example: 'Fix authentication bug',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  title!: string;

  @ApiPropertyOptional({
    example: [
      {
        title: 'Frontend',
        backgroundColor: '#3b82f6',
      },
    ],
    type: [TaskLabelDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskLabelDto)
  labels!: TaskLabelDto[];

  @ApiPropertyOptional({
    example: 'Update login flow',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({
    example: '#22c55e',
  })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({
    example: TaskPriority.HIGH,
    enum: TaskPriority,
  })
  @IsOptional()
  @IsIn(['Low', 'Medium', 'High', 'Urgent'])
  priority?: TaskPriority;

  @ApiPropertyOptional({
    example: '2026-10-10',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: [2, 4],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  assigneeIds?: number[];
}
