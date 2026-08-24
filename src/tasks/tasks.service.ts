import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Column } from 'src/columns/entities/column.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User) {
    const {
      projectId,
      columnId,
      assigneeIds = [],
      ...taskData
    } = createTaskDto;

    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
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
    const column = await this.columnRepository.findOne({
      where: {
        id: columnId,
        project: {
          id: projectId,
        },
      },
    });

    if (!column) {
      throw new NotFoundException('column not found');
    }

    let assignees: User[] = [];

    if (assigneeIds.length > 0) {
      assignees = await this.userRepository.find({
        where: assigneeIds.map((id) => ({ id })),
      });

      if (assignees.length !== assigneeIds.length) {
        throw new NotFoundException('One or more assignees not found');
      }

      const projectMemberIds = await this.projectMemberRepository.find({
        where: {
          project: {
            id: projectId,
          },
          user: {
            id: In(assigneeIds),
          },
        },
        relations: {
          user: true,
        },
      });

      if (projectMemberIds.length !== assigneeIds.length) {
        throw new BadRequestException('All assignees must be project members');
      }
    }
    const task = this.taskRepository.create({
      ...taskData,
      project,
      column,
      assignees,
      creator: user,
    });

    const taskSaved = await this.taskRepository.save(task);

    return {
      success: true,
      data: taskSaved,
      message: 'task saved successfully',
    };
  }

  async update(taskId: number, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: {
        project: {
          owner: true,
        },
        creator: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isOwner = task.project.owner.id === user.id;
    const isCreator = task.creator?.id === user.id;

    if (!isOwner && !isCreator) {
      throw new ForbiddenException(
        'You do not have permission to edit this task',
      );
    }

    const { assigneeIds, ...taskData } = updateTaskDto;

    Object.assign(task, taskData);

    if (assigneeIds !== undefined && assigneeIds.length > 0) {
      const assignees = await this.userRepository.find({
        where: assigneeIds.map((id) => ({ id })),
      });

      if (assignees.length !== assigneeIds.length) {
        throw new NotFoundException('One or more assignees not found');
      }

      task.assignees = assignees;
    } else task.assignees = [];

    const updatedTask = await this.taskRepository.save(task);

    return {
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    };
  }

  async remove(taskId: number, user: User) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: {
        project: {
          owner: true,
        },
        creator: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isOwner = task.project.owner.id === user.id;
    const isCreator = task.creator?.id === user.id;

    if (!isOwner && !isCreator) {
      throw new ForbiddenException(
        'You do not have permission to delete this task',
      );
    }

    await this.taskRepository.delete(taskId);

    return {
      success: true,
      message: 'Task removed successfully',
    };
  }

  findAll() {
    return this.taskRepository.find({
      relations: {
        assignees: true,
      },
    });
  }

  findOne(id: number) {
    return this.taskRepository.findOne({
      where: {
        id,
      },
      relations: {
        assignees: true,
      },
    });
  }
}
