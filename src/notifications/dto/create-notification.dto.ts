import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNMENT,
    description: 'Notification type',
  })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({
    example: 'You were assigned to a task',
    description: 'Notification message',
  })
  @IsString()
  message!: string;

  @ApiProperty({
    example: 'FlowBoard Project',
    description: 'Notification subject',
  })
  @IsString()
  subject!: string;
}
