import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import {
  ProjectMember,
  ProjectMemberRole,
} from '../project-members/entities/project-member.entity';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async requireRoles(
    user: User,
    projectId: number,
    roles: ProjectMemberRole[],
  ) {
    const member = await this.projectMemberRepository.findOne({
      where: {
        project: {
          id: projectId,
        },
        user: {
          id: user.id,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this project');
    }

    if (!roles.includes(member.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return member;
  }

  async requireRole(user: User, projectId: number, role: ProjectMemberRole) {
    return this.requireRoles(user, projectId, [role]);
  }
}
