import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsInt()
  @Min(0)
  position!: number;
}
