import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 'Shahin',
    description: 'User full name',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  name!: string;

  @ApiProperty({
    example: 'shahin@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 20,
    description: 'User age',
    minimum: 18,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  @Max(100)
  age!: number;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
