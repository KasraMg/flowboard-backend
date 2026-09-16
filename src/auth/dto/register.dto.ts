import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Shahin',
    description: 'User full name',
  })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    example: 'shahin@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '123456',
    description: 'Account password',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
