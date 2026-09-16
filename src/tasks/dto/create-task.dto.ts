import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement drag and drop',
    description: 'Task title',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title!: string;

  @ApiPropertyOptional({
    example: 'Implement Trello like drag and drop system',
    description: 'Task description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Task completion status',
  })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({
    example: '#6366f1',
    description: 'Task background color',
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
    example: '2026-10-01',
    description: 'Task due date',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    example: 1,
    description: 'Project id',
  })
  @IsInt()
  projectId!: number;

  @ApiProperty({
    example: 3,
    description: 'Column id',
  })
  @IsInt()
  columnId!: number;

  @ApiPropertyOptional({
    example: [5, 8],
    description: 'Assigned user ids',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  assigneeIds?: number[];
}
