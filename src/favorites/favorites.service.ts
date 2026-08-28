import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async toggle(projectId: number, user: User) {
    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const isFavorite = await this.favoriteRepository.findOne({
      where: {
        project: {
          id: projectId,
        },
        user: {
          id: user.id,
        },
      },
    });

    if (isFavorite) {
      await this.favoriteRepository.remove(isFavorite);
      return {
        message: 'favorite deleted successfully',
        success: true,
      };
    } else {
      const favorite = this.favoriteRepository.create({
        project,
        user,
      });

      const savedFavorite = await this.favoriteRepository.save(favorite);
      return {
        message: 'favorite created successfully',
        success: true,
        data: savedFavorite,
      };
    }
  }

  async findAll(user: User) {
    const favorites = await this.favoriteRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
    });
    return {
      success: true,
      data: favorites,
    };
  }
}
