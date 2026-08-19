import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ProjectStatus } from 'src/projects/entities/project.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ProjectMember)
    private projectMemberRepository: Repository<ProjectMember>,

    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getDashboard(userId: number) {
    const [
      totalProjects,
      recentProjects,
      totalTasks,
      completedTasks,
      recentTasks,
    ] = await Promise.all([
      this.projectMemberRepository.count({
        where: {
          user: {
            id: userId,
          },
        },
      }),

      this.projectMemberRepository.find({
        where: {
          user: {
            id: userId,
          },
          project: {
            status: ProjectStatus.ACTIVE,
          },
        },
        relations: {
          project: true,
        },
        order: {
          project: {
            createdAt: 'DESC',
          },
        },
        take: 4,
      }),

      this.taskRepository.count({
        where: {
          assignees: {
            id: userId,
          },
        },
      }),

      this.taskRepository.count({
        where: {
          assignees: {
            id: userId,
          },
          completed: true,
        },
      }),

      this.taskRepository.find({
        where: {
          assignees: {
            id: userId,
          },
        },
        order: {
          updatedAt: 'DESC',
        },
        take: 7,
      }),
    ]);

    return {
      success: true,
      data: {
        stats: {
          totalProjects,
          totalTasks,
          completedTasks,
          incompleteTasks: totalTasks - completedTasks,
        },

        recentProjects: recentProjects.map((member) => member.project),

        recentTasks,
      },
    };
  }
}
