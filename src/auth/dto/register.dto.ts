import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsEmail()
  email!: string;

  // @Type(() => Number)
  // @IsNumber()
  // @Min(18)
  // @Max(100)
  // age!: number;

  @IsString()
  @MinLength(6)
  password!: string;
}
