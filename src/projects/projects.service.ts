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

  findAll(user: User) {
    return this.projectRepository.find({
      where: {
        owner: {
          id: user.id,
        },
      },
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
