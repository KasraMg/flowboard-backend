import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Shahin',
    description: 'User display name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'shahin@example.com',
    description: 'User email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'oldPassword123',
    description: 'Current password required when changing password',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Enable or disable email notifications',
  })
  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean;

  @ApiPropertyOptional({
    example: 'newPassword123',
    description: 'New password (minimum 8 characters)',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}
