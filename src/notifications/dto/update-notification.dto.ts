import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  message!: string;

  @IsOptional()
  @IsBoolean()
  isRead!: boolean;

  @IsOptional()
  @IsString()
  subject!: boolean;
}
