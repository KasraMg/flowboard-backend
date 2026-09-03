import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';

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

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.userRepository.update(id, dto);
    return this.getUser(id);
  }
}
