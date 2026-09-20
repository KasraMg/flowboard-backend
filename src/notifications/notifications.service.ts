import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '@/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InvitationsService } from '@/invitations/invitations.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly invitationsService: InvitationsService,
  ) {}

  async create(userId: number, createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      user: { id: userId },
      ...createNotificationDto,
    });

    await this.notificationRepository.save(notification);

    return {
      message: 'Notification created successfully',
    };
  }

  async findAll(user: User) {
    const invitations = await this.invitationsService.findAll(user);
    const notifications = await this.notificationRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    return {
      invitations,
      notifications,
    };
  }

  async update(user: User, id: number) {
    const notification = await this.notificationRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;

    await this.notificationRepository.save(notification);

    return {};
  }

  async readAll(user: User) {
    await this.notificationRepository.update(
      {
        user: {
          id: user.id,
        },
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return {};
  }

  async remove(id: number) {
    await this.notificationRepository.delete({
      id,
    });
    return {
      message: 'Notification deleted successfully',
    };
  }
}
