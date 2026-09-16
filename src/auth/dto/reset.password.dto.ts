import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'newPassword123',
    description: 'New account password',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
