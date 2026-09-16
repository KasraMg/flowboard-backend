/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import {
  ProjectMember,
  ProjectMemberRole,
} from 'src/project-members/entities/project-member.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { DataSource } from 'typeorm';
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    return this.dataSource.transaction(async (manager) => {
      const project = manager.create(Project, {
        ...createProjectDto,
        owner: user,
      });

      const savedProject = await manager.save(Project, project);

      const projectMember = manager.create(ProjectMember, {
        project: savedProject,
        role: ProjectMemberRole.OWNER,
        user,
      });

      await manager.save(ProjectMember, projectMember);

      return {
        message: 'project created successfully',
        project: savedProject,
      };
    });
  }

  async findAll(user: User) {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.tasks', 'task')
      .innerJoin('project.members', 'member')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('member.userId = :userId', {
        userId: user.id,
      })
      .select([
        'project.id',
        'project.title',
        'project.description',
        'project.background',
        'project.status',
        'project.createdAt',
        'project.updatedAt',
        'owner.id',
        'owner.name',
        'owner.email',
      ])
      .addSelect('COUNT(task.id)', 'totalTasks')
      .addSelect(
        `COUNT(CASE WHEN task.completed = true THEN 1 END)`,
        'completedTasks',
      )
      .addSelect(
        `EXISTS (
        SELECT 1
        FROM favorite favorite
        WHERE favorite."projectId" = project.id
        AND favorite."userId" = :userId
      )`,
        'isFave',
      )
      .setParameter('userId', user.id)
      .groupBy('project.id')
      .addGroupBy('owner.id')
      .orderBy('project.createdAt', 'DESC')
      .getRawAndEntities();

    return projects.entities.map((project, index) => {
      const raw = projects.raw[index];

      const totalTasks = Number(raw.totalTasks);
      const completedTasks = Number(raw.completedTasks);

      const isFave =
        raw.isFave === true ||
        raw.isFave === 'true' ||
        raw.isFave === 1 ||
        raw.isFave === '1';

      return {
        project: {
          ...project,
          isFave,
        },
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          incomplete: totalTasks - completedTasks,
          completionPercentage:
            totalTasks === 0
              ? 0
              : Math.round((completedTasks / totalTasks) * 100),
        },
      };
    });
  }

  async findOne(id: number, user: User) {
    const project = await this.projectRepository.findOne({
      where: {
        id,
        members: {
          user: {
            id: user.id,
          },
        },
      },
      relations: {
        owner: true,
        members: {
          user: true,
        },
        columns: {
          tasks: {
            assignees: true,
            project: {
              owner: true,
            },
            creator: true,
          },
        },
      },
      order: {
        columns: {
          position: 'ASC',
          tasks: {
            position: 'ASC',
          },
        },
        members: {
          createdAt: 'ASC',
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isProjectUserFave = await this.favoriteRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        project: {
          id: project.id,
        },
      },
    });

    project.isFave = Boolean(isProjectUserFave);

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, user: User) {
    const project = await this.projectRepository.findOne({
      where: {
        id,
        owner: {
          id: user.id,
        },
      },
      relations: {
        owner: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    Object.assign(project, updateProjectDto);

    const updatedProject = await this.projectRepository.save(project);

    return {
      project: updatedProject,
      message: 'project updated successfully',
    };
  }

  async remove(id: number, user: User) {
    const project = await this.projectRepository.findOne({
      where: {
        id,
        owner: {
          id: user.id,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.delete(project.id);

    return {
      message: 'project deleted successfully',
    };
  }
}
