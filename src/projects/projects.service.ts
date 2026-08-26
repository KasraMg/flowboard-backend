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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      owner: user,
    });

    const savedProject = await this.projectRepository.save(project);

    const projectMember = this.projectMemberRepository.create({
      project: savedProject,
      role: ProjectMemberRole.OWNER,
      user,
    });
    await this.projectMemberRepository.save(projectMember);

    return {
      message: 'project created successfully',
      success: true,
      data: savedProject,
    };
  }

  async findAll(user: User) {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoin('project.tasks', 'task')
      .where('project.ownerId = :userId', {
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
      ])
      .addSelect('COUNT(task.id)', 'totalTasks')
      .addSelect(
        `COUNT(CASE WHEN task.completed = true THEN 1 END)`,
        'completedTasks',
      )
      .groupBy('project.id')
      .orderBy('project.createdAt', 'DESC')
      .getRawAndEntities();

    return projects.entities.map((project, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const totalTasks = Number(projects.raw[index].totalTasks);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const completedTasks = Number(projects.raw[index].completedTasks);

      return {
        ...project,
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
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.owner.id === user.id;

    const isMember = project.members.some(
      (member) => member.user.id === user.id,
    );

    if (!isOwner && !isMember) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
