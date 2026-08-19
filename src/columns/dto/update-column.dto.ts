import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
