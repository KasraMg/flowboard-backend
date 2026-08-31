import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ProjectMember,
  ProjectMemberRole,
} from './entities/project-member.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async removeUser(projectId: number, userId: number, user: User) {
    const projectMember = await this.projectMemberRepository.findOne({
      where: {
        project: {
          id: projectId,
        },
        user: {
          id: userId,
        },
      },
      relations: {
        project: {
          owner: true,
        },
      },
    });

    if (!projectMember) {
      throw new NotFoundException('member not found');
    }
    if (projectMember.project.owner.id !== user.id) {
      throw new ConflictException(
        'You are not allowed to remove project users',
      );
    }

    if (projectMember.role == ProjectMemberRole.OWNER) {
      throw new ConflictException('owner cannot be removed');
    }

    await this.projectMemberRepository.delete(projectMember.id);
    return {
      success: true,
      message: 'User removed successfully',
    };
  }
  findAll() {
    return this.projectMemberRepository.find();
  }

  async findProjectMembers(id: number, user: User) {
    const projectsMember = await this.projectMemberRepository.find({
      where: {
        project: {
          id,
        },
      },
      relations: {
        user: true,
      },
    });

    const isUserMember = projectsMember.find(
      (project) => project.user.id == user.id,
    );
    if (!isUserMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return {
      success: true,
      projectsMember,
    };
  }
}
