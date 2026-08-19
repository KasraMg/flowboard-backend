import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  name!: string;

  @IsEmail()
  email!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(18)
  @Max(100)
  age!: number;

  @IsString()
  @MinLength(8)
  password!: string;
}
