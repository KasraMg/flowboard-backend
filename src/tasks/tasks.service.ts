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
import { User } from '@/users/entities/user.entity';
import { Project } from '@/projects/entities/project.entity';
import { Column } from '@/columns/entities/column.entity';
import {
  ProjectMember,
  ProjectMemberRole,
} from '@/project-members/entities/project-member.entity';
import { ReorderTasksDto } from './dto/reorder-task-dto';
import { MailService } from '@/mail/mail.service';
import { NotificationsService } from '@/notifications/notifications.service';
import { NotificationType } from '@/notifications/entities/notification.entity';
import { AuthorizationService } from '@/common/authorization.service';

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

    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
    private readonly authorizationService: AuthorizationService,
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
        columns: {
          id: columnId,
        },
      },
      relations: {
        columns: true,
      },
    });

    if (!project) {
      throw new NotFoundException('project not found');
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

    const column = project.columns.find((c) => c.id == columnId);

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
      task: taskSaved,
      message: 'task saved successfully',
    };
  }

  async update(taskId: number, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: {
        column: {
          project: true,
        },
        assignees: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.authorizationService.requireRoles(user, task.column.project.id, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.ADMIN,
      ProjectMemberRole.MEMBER,
    ]);

    const { assigneeIds, ...taskData } = updateTaskDto;

    Object.assign(task, taskData);

    let newAssignees: User[] = [];

    if (assigneeIds !== undefined && assigneeIds.length > 0) {
      const assignees = await this.userRepository.find({
        where: assigneeIds.map((id) => ({ id })),
      });

      if (assignees.length !== assigneeIds.length) {
        throw new NotFoundException('One or more assignees not found');
      }

      const currentAssigneeIds = task.assignees.map((assignee) => assignee.id);

      newAssignees = assignees.filter(
        (assignee) => !currentAssigneeIds.includes(assignee.id),
      );

      task.assignees = assignees;
    } else if (assigneeIds !== undefined) {
      task.assignees = [];
    }

    const updatedTask = await this.taskRepository.save(task);

    for (const assignee of newAssignees) {
      await this.notificationsService.create(assignee.id, {
        message: `You were assigned to the task "${updatedTask.title}"`,
        type: NotificationType.TASK_ASSIGNMENT,
        subject: task.column.project.title,
      });
      if (!assignee.emailNotification) {
        continue;
      }

      await this.mailService.sendTaskAssignmentEmail(
        assignee.email,
        updatedTask,
      );
    }

    return {
      task: updatedTask,
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

    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.authorizationService.requireRoles(user, projectId, [
      ProjectMemberRole.OWNER,
      ProjectMemberRole.ADMIN,
      ProjectMemberRole.MEMBER,
    ]);

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

    const isMovingBetweenColumns = sourceColumnId !== targetColumnId;

    if (!isMovingBetweenColumns && !targetTaskIds.has(taskId)) {
      throw new BadRequestException('Task does not belong to target column');
    }

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
      message: 'Task reordered successfully',
    };
  }
}
