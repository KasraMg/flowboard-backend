import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectMember } from './entities/project-member.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
  ) {}

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
