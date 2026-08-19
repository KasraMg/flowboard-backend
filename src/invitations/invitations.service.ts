import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import {
  InvitationAction,
  UpdateInvitationDto,
} from './dto/update-invitation.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { DataSource, Repository } from 'typeorm';
import { Project } from 'src/projects/entities/project.entity';
import {
  ProjectMember,
  ProjectMemberRole,
} from 'src/project-members/entities/project-member.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private dataSource: DataSource,
  ) {}

  async create(createInvitationDto: CreateInvitationDto, user: User) {
    const project = await this.projectRepository.findOne({
      where: {
        id: createInvitationDto.projectId,
        owner: {
          id: user.id,
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const invitedUser = await this.userRepository.findOne({
      where: {
        email: createInvitationDto.email,
      },
    });

    if (!invitedUser) {
      throw new NotFoundException('User not found');
    }

    const existingInvitation = await this.invitationRepository.findOne({
      where: {
        invitedUser: {
          email: createInvitationDto.email,
        },
        project: {
          id: createInvitationDto.projectId,
        },
        status: InvitationStatus.PENDING,
      },
    });
    if (existingInvitation) {
      throw new ConflictException(
        'User already has a pending invitation to this project',
      );
    }

    const invitation = this.invitationRepository.create({
      invitedBy: user,
      project,
      invitedUser,
      status: InvitationStatus.PENDING,
    });

    await this.invitationRepository.save(invitation);

    return {
      message: 'Invitation created successfully',
      success: true,
      data: invitation,
    };
  }

  findAll(user: User) {
    return this.invitationRepository.find({
      where: {
        invitedUser: user,
        status: InvitationStatus.PENDING,
      },
      relations: {
        project: true,
        invitedBy: true,
      },
    });
  }

  async changeStatus(
    id: number,
    updateInvitationDto: UpdateInvitationDto,
    user: User,
  ) {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id,
        invitedUser: {
          id: user.id,
        },
      },
      relations: {
        project: true,
        invitedUser: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Invitation is no longer pending');
    }

    if (updateInvitationDto.action === InvitationAction.REJECT) {
      invitation.status = InvitationStatus.REJECTED;

      await this.invitationRepository.save(invitation);

      return {
        message: 'Invitation rejected successfully',
        success: true,
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      invitation.status = InvitationStatus.ACCEPTED;

      await queryRunner.manager.save(Invitation, invitation);

      const existingMember = await queryRunner.manager.findOne(ProjectMember, {
        where: {
          project: {
            id: invitation.project.id,
          },
          user: {
            id: user.id,
          },
        },
      });

      if (existingMember) {
        throw new ConflictException('User is already a member of this project');
      }

      const projectMember = queryRunner.manager.create(ProjectMember, {
        project: invitation.project,
        user,
        role: ProjectMemberRole.MEMBER,
      });

      await queryRunner.manager.save(ProjectMember, projectMember);

      await queryRunner.commitTransaction();

      return {
        message: 'Invitation accepted successfully',
        success: true,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} invitation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invitation`;
  }
}
