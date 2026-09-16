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
import { AuthorizationService } from 'src/common/authorization.service';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,

    private readonly authorizationService: AuthorizationService,
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
    });

    if (!projectMember) {
      throw new NotFoundException('member not found');
    }
    await this.authorizationService.requireRoles(user, projectId, [
      ProjectMemberRole.OWNER,
    ]);

    if (projectMember.role == ProjectMemberRole.OWNER) {
      throw new ConflictException('owner cannot be removed');
    }

    await this.projectMemberRepository.delete(projectMember.id);
    return {
      message: 'User removed successfully',
    };
  }
  findAll() {
    return this.projectMemberRepository.find();
  }

  async findProjectMembers(id: number, user: User) {
    const projectsMembers = await this.projectMemberRepository.find({
      where: {
        project: {
          id,
        },
      },
      relations: {
        user: true,
      },
    });

    const isUserMember = projectsMembers.find(
      (project) => project.user.id == user.id,
    );
    if (!isUserMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return {
      projectsMembers,
    };
  }
}
