import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { Repository } from 'typeorm';
import { Column } from './entities/column.entity';
import { ReorderColumnsDto } from './dto/reorder-column-dto';
import { AuthorizationService } from 'src/common/authorization.service';
import { ProjectMemberRole } from 'src/project-members/entities/project-member.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(Column)
    private columnRepository: Repository<Column>,

    private readonly authorizationService: AuthorizationService,
  ) {}

  async create(
    createColumnDto: CreateColumnDto,
    user: User,
    projectId: number,
  ) {
    const project = await this.projectRepository.findOne({
      where: {
        id: Number(projectId),
        members: {
          user: {
            id: user.id,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('project not found');
    }
    const newColumn = this.columnRepository.create({
      ...createColumnDto,
      project: project,
    });

    const savedColumn = await this.columnRepository.save(newColumn);

    return {
      message: 'column created successfully',
      column: savedColumn,
    };
  }

  async update(id: number, updateColumnDto: UpdateColumnDto, user: User) {
    const column = await this.columnRepository.findOne({
      where: {
        id,
      },
      relations: {
        project: {
          owner: true,
          members: {
            user: true,
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.authorizationService.requireRoles(user, column.project.id, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.ADMIN,
      ProjectMemberRole.MEMBER,
    ]);

    Object.assign(column, updateColumnDto);

    const updatedColumn = await this.columnRepository.save(column);

    return {
      message: 'Column updated successfully',
      column: updatedColumn,
    };
  }

  async reorder(
    projectId: number,
    reorderColumnsDto: ReorderColumnsDto,
    user: User,
  ) {
    const { columnIds } = reorderColumnsDto;

    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
      },
      relations: {
        members: {
          user: true,
        },
        owner: true,
      },
    });

    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    await this.authorizationService.requireRoles(user, project.id, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.ADMIN,
      ProjectMemberRole.MEMBER,
    ]);

    const columns = await this.columnRepository.find({
      where: {
        project: {
          id: projectId,
        },
      },
    });

    if (columns.length !== columnIds.length) {
      throw new BadRequestException('Invalid columns');
    }

    const columnIdsSet = new Set(columns.map((column) => column.id));

    const isValid = columnIds.every((id) => columnIdsSet.has(id));

    if (!isValid) {
      throw new BadRequestException(
        'One or more columns do not belong to this project',
      );
    }

    const reorderedColumns = columnIds.map((columnId, index) => {
      const column = columns.find((column) => column.id === columnId)!;

      column.position = index;

      return column;
    });

    await this.columnRepository.save(reorderedColumns);

    return {
      message: 'Columns reordered successfully',
    };
  }

  async remove(id: number, user: User) {
    const column = await this.columnRepository.findOne({
      where: {
        id,
      },
      relations: {
        project: true,
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.authorizationService.requireRoles(user, column.project.id, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.ADMIN,
      ProjectMemberRole.MEMBER,
    ]);

    await this.columnRepository.delete(id);

    return {
      message: 'Column removed successfully',
    };
  }
}
