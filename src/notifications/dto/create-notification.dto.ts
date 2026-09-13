import { IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';
import { Column } from 'typeorm';

export class CreateNotificationDto {
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type!: NotificationType;

  @IsString()
  message!: string;

  @IsString()
  subject!: string;
}
