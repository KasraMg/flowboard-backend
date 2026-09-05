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
import { TaskPriority } from '../entities/task.entity';
import { Type } from 'class-transformer';

class TaskLabelDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsHexColor()
  backgroundColor!: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  title!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskLabelDto)
  labels!: TaskLabelDto[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsIn(['Low', 'Medium', 'High', 'Urgent'])
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  assigneeIds?: number[];
}
