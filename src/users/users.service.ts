import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Notification } from 'src/notifications/entities/notification.entity';
import {
  Invitation,
  InvitationStatus,
} from 'src/invitations/entities/invitation.entity';
import { ImageKitService } from 'src/imagekit/imagekit.service';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private readonly imageKitService: ImageKitService,
  ) {}

  getUsers() {
    return this.userRepository.find();
  }

  async getSidebar(user: User) {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .innerJoin('project.members', 'projectMember')
      .innerJoin('project.tasks', 'task')
      .where('projectMember.userId = :userId', {
        userId: user.id,
      })
      .distinct(true)
      .getMany();

    const favorites = await this.favoriteRepository.find({
      where: {
        user: { id: user.id },
      },
      relations: {
        project: true,
      },
    });

    const unreadNotifications = await this.notificationRepository.count({
      where: {
        user: { id: user.id },
        isRead: false,
      },
    });

    const pendingInvitations = await this.invitationRepository.count({
      where: {
        invitedUser: { id: user.id },
        status: InvitationStatus.PENDING,
      },
    });

    const notificationCount = unreadNotifications + pendingInvitations;

    return {
      projects,
      favorites,
      notificationCount,
    };
  }

  async updateUser(user: User, dto: UpdateUserDto) {
    const { currentPassword, newPassword, ...userData } = dto;

    if (newPassword) {
      if (!currentPassword) {
        throw new BadRequestException('Current password is required');
      }

      const userWithPassword = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.id = :id', { id: user.id })
        .getOne();

      if (!userWithPassword) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userWithPassword.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.userRepository.update(user.id, {
        ...userData,
        password: hashedPassword,
      });
    } else {
      await this.userRepository.update(user.id, userData);
    }

    return {
      message: 'Account updated successfully',
    };
  }

  async updateAvatar(user: User, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Avatar is required');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG and WebP images are allowed',
      );
    }

    const oldAvatarFileId = user.avatarFileId;

    const result = await this.imageKitService.uploadImage(
      file.buffer,
      `avatar-${user.id}-${Date.now()}`,
    );

    await this.userRepository.update(user.id, {
      avatar: result.url,
      avatarFileId: result.fileId,
    });

    if (oldAvatarFileId) {
      try {
        await this.imageKitService.deleteFile(oldAvatarFileId);
      } catch (error) {
        console.error('Failed to delete old avatar from ImageKit:', error);
      }
    }

    return {
      message: 'Avatar updated successfully',
      avatar: result.url,
    };
  }
}
