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
import { ReorderTasksDto } from './dto/reorder-task-dto';

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

    const lastTask = await this.taskRepository.findOne({
      where: {
        column: {
          id: columnId,
        },
      },
      order: {
        position: 'DESC',
      },
    });

    const position = lastTask ? lastTask.position + 1 : 0;

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
      position,
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

    // const isOwner = task.project.owner.id === user.id;
    // const isCreator = task.creator?.id === user.id;

    // if (!isOwner && !isCreator) {
    //   throw new ForbiddenException(
    //     'You do not have permission to edit this task',
    //   );
    // }

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

  async reorder(
    projectId: number,
    reorderTasksDto: ReorderTasksDto,
    user: User,
  ) {
    const { taskId, targetColumnId, taskIds } = reorderTasksDto;

    // -------------------------
    // Check project permission
    // -------------------------

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

    const isOwner = project.owner.id === user.id;

    const isMember = project.members.some(
      (member) => member.user.id === user.id,
    );

    if (!isOwner && !isMember) {
      throw new ForbiddenException(
        'You do not have permission to reorder tasks',
      );
    }

    // -------------------------
    // Validate task
    // -------------------------

    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
        project: {
          id: projectId,
        },
      },
      relations: {
        column: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const sourceColumnId = task.column.id;

    // -------------------------
    // Validate target column
    // -------------------------

    const targetColumn = await this.columnRepository.findOne({
      where: {
        id: targetColumnId,
        project: {
          id: projectId,
        },
      },
    });

    if (!targetColumn) {
      throw new BadRequestException(
        'Target column does not belong to this project',
      );
    }

    // -------------------------
    // Validate taskIds
    // -------------------------

    if (!taskIds.length) {
      throw new BadRequestException('Task order cannot be empty');
    }

    if (!taskIds.includes(taskId)) {
      throw new BadRequestException(
        'Dragged task must exist in target task order',
      );
    }

    if (new Set(taskIds).size !== taskIds.length) {
      throw new BadRequestException('Duplicate task IDs');
    }

    // -------------------------
    // Get target tasks
    // -------------------------

    const targetTasks = await this.taskRepository.find({
      where: {
        column: {
          id: targetColumnId,
        },
        project: {
          id: projectId,
        },
      },
    });

    const targetTaskIds = new Set(
      targetTasks.map((targetTask) => targetTask.id),
    );

    // اگر task از ستون دیگری آمده،
    // طبیعی است که هنوز داخل targetTasks نباشد.
    const isMovingBetweenColumns = sourceColumnId !== targetColumnId;

    if (!isMovingBetweenColumns && !targetTaskIds.has(taskId)) {
      throw new BadRequestException('Task does not belong to target column');
    }

    // تمام taskهای موجود در ستون مقصد
    // + task منتقل‌شده اگر از ستون دیگری آمده باشد
    const expectedTaskIds = new Set(targetTaskIds);

    if (isMovingBetweenColumns) {
      expectedTaskIds.add(taskId);
    }

    if (
      expectedTaskIds.size !== taskIds.length ||
      taskIds.some((id) => !expectedTaskIds.has(id))
    ) {
      throw new BadRequestException('Invalid task order');
    }
 

    const tasks = await this.taskRepository.find({
      where: taskIds.map((id) => ({
        id,
        project: {
          id: projectId,
        },
      })),
    });

    if (tasks.length !== taskIds.length) {
      throw new BadRequestException(
        'One or more tasks do not belong to this project',
      );
    }

    // -------------------------
    // Move task to target column
    // -------------------------

    const reorderedTasks = taskIds.map((id, index) => {
      const currentTask = tasks.find((item) => item.id === id);

      if (!currentTask) {
        throw new BadRequestException('Invalid task order');
      }

      currentTask.position = index;

      if (currentTask.id === taskId) {
        currentTask.column = targetColumn;
      }

      return currentTask;
    });

    await this.taskRepository.save(reorderedTasks);

    // -------------------------
    // Reorder source column
    // -------------------------

    if (isMovingBetweenColumns) {
      const sourceTasks = await this.taskRepository.find({
        where: {
          column: {
            id: sourceColumnId,
          },
          project: {
            id: projectId,
          },
        },
        order: {
          position: 'ASC',
        },
      });

      sourceTasks.forEach((sourceTask, index) => {
        sourceTask.position = index;
      });

      await this.taskRepository.save(sourceTasks);
    }

    return {
      success: true,
      message: 'Task reordered successfully',
    };
  }
}
