import {
  IsEmail,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsEmail()
  email!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(18)
  @Max(100)
  age!: number;

  @IsString()
  @MinLength(6)
  password!: string;
}
