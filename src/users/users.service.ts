/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  getUsers() {
    return this.userRepository.find();
  }
  getUser(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        projects: true,
        assignedTasks: true,
      },
    });
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

    return {
      data: {
        projects: projects,
        favorites: favorites,
      },
      success: true,
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
      success: true,
    };
  }

  async updateAvatar(user: User, file: Express.Multer.File) {
    console.log(user);

    if (!file) {
      throw new BadRequestException('Avatar is required');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG and WebP images are allowed',
      );
    }

    const uploadDir = join(process.cwd(), 'uploads', 'avatars');

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const fileName = `${randomUUID()}.webp`;
    const filePath = join(uploadDir, fileName);

    const avatarPath = `/uploads/avatars/${fileName}`;

    const oldAvatar = user.avatar;

    try {
      await fs.writeFile(filePath, file.buffer);

      await this.userRepository.update(user.id, {
        avatar: avatarPath,
      });

      if (oldAvatar) {
        const oldAvatarPath = join(process.cwd(), oldAvatar);

        try {
          await fs.unlink(oldAvatarPath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error('Failed to delete old avatar:', error);
          }
        }
      }

      return {
        message: 'Avatar updated successfully',
        success: true,
        avatar: avatarPath,
      };
    } catch (error) {
      try {
        await fs.unlink(filePath);
      } catch {
        //
      }

      throw error;
    }
  }
}
