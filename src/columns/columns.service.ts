import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { Repository } from 'typeorm';
import { Column } from './entities/column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,

    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
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
      success: true,
      data: savedColumn,
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

    const isOwner = column.project.owner.id === user.id;

    const isMember = column.project.members.some(
      (member) => member.user.id === user.id,
    );

    if (!isOwner && !isMember) {
      throw new NotFoundException('Column not found');
    }

    Object.assign(column, updateColumnDto);

    const updatedColumn = await this.columnRepository.save(column);

    return {
      message: 'Column updated successfully',
      success: true,
      data: updatedColumn,
    };
  }
}
