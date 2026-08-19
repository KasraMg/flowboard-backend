import { IsEmail, IsInt } from 'class-validator';

export class CreateInvitationDto {
  @IsInt()
  projectId!: number;

  @IsEmail()
  email!: string;
}
