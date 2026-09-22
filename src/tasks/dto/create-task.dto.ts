import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
