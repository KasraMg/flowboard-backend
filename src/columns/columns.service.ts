import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { Repository } from 'typeorm';
import { Column } from './entities/column.entity';
import { ReorderColumnsDto } from './dto/reorder-column-dto';
import { AuthorizationService } from '../common/authorization.service';

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
        project: {
          members: {
            user: {
              id: user.id,
            },
          },
        },
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

    Object.assign(column, updateColumnDto);

    const updatedColumn = await this.columnRepository.update(id, column);

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
        members: {
          user: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      throw new ForbiddenException('Project not found');
    }

    if (!columnIds.length) {
      throw new BadRequestException('Invalid columns');
    }

    if (new Set(columnIds).size !== columnIds.length) {
      throw new BadRequestException('Duplicate column IDs');
    }

    const columns = await this.columnRepository.find({
      where: {
        project: {
          id: projectId,
        },
      },
      select: {
        id: true,
      },
    });

    if (columns.length !== columnIds.length) {
      throw new BadRequestException('Invalid columns');
    }

    const columnIdsSet = new Set(columns.map((column) => column.id));

    if (!columnIds.every((id) => columnIdsSet.has(id))) {
      throw new BadRequestException(
        'One or more columns do not belong to this project',
      );
    }

    const positionCase = columnIds
      .map((id, index) => `WHEN id = ${id} THEN ${index}`)
      .join(' ');

    await this.columnRepository
      .createQueryBuilder()
      .update()
      .set({
        position: () => `CASE ${positionCase} END`,
      })
      .where('projectId = :projectId', {
        projectId,
      })
      .andWhere('id IN (:...columnIds)', {
        columnIds,
      })
      .execute();

    return {
      message: 'Columns reordered successfully',
    };
  }

  async remove(id: number, user: User) {
    const column = await this.columnRepository.findOne({
      where: {
        id,
        project: {
          members: {
            user: {
              id: user.id,
            },
          },
        },
      },
      relations: {
        project: true,
      },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.columnRepository.delete(id);

    return {
      message: 'Column removed successfully',
    };
  }
}
