import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({
    example: 'In Progress',
    description: 'Column title',
  })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({
    example: 0,
    description: 'Column position in board',
  })
  @IsInt()
  @Min(0)
  position!: number;
}
