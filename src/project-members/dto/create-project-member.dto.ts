import { IsString } from 'class-validator';

export class CreateProjectMemberDto {
  @IsString()
  role!: string;
}
