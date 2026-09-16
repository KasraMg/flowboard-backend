import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    example: 1,
    description: 'Target project id',
  })
  @IsInt()
  projectId!: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of invited user',
  })
  @IsEmail()
  email!: string;
}
