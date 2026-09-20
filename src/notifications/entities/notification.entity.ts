import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

export enum NotificationType {
  SITE = 'site',
  TASK_ASSIGNMENT = 'task_assignment',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: NotificationType;

  @Column()
  message: string;

  @Column()
  subject: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @RelationId((notification: Notification) => notification.user)
  userId: number;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;
}
