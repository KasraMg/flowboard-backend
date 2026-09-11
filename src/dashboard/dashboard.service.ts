/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
    const recentProjectsPromise = this.projectMemberRepository
      .createQueryBuilder('projectMember')
      .innerJoinAndSelect('projectMember.project', 'project')
      .leftJoin('project.tasks', 'task')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('projectMember.userId = :userId', { userId })
      .andWhere('project.status = :status', {
        status: ProjectStatus.ACTIVE,
      })
      .select([
        'projectMember.id',
        'project.id',
        'project.title',
        'project.description',
        'project.background',
        'project.status',
        'project.createdAt',
        'project.updatedAt',
        'owner.id',
        'owner.name',
        'owner.email',
      ])
      .addSelect('COUNT(task.id)', 'totalTasks')
      .addSelect(
        `COUNT(CASE WHEN task.completed = true THEN 1 END)`,
        'completedTasks',
      )
      .addSelect(
        `EXISTS (
        SELECT 1
        FROM favorite favorite
        WHERE favorite."projectId" = project.id
        AND favorite."userId" = :userId
      )`,
        'isFave',
      )
      .setParameter('userId', userId)
      .groupBy('projectMember.id')
      .addGroupBy('project.id')
      .addGroupBy('owner.id')
      .orderBy('project.createdAt', 'DESC')
      .limit(4)
      .getRawAndEntities();

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

      recentProjectsPromise,

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
        relations: {
          project: true,
          assignees: true,
        },
        order: {
          updatedAt: 'DESC',
        },
        take: 7,
      }),
    ]);

    const recentProjectsData = recentProjects.entities.map((project, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const raw = recentProjects.raw[index];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const total = Number(raw.totalTasks);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const completed = Number(raw.completedTasks);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const isFave =
        raw.isFave === true ||
        raw.isFave === 'true' ||
        raw.isFave === 1 ||
        raw.isFave === '1';

      return {
        ...project,
        isFave,
        taskStats: {
          total,
          completed,
          incomplete: total - completed,
          completionPercentage:
            total === 0 ? 0 : Math.round((completed / total) * 100),
        },
      };
    });

    return {
      success: true,
      data: {
        stats: {
          totalProjects,
          totalTasks,
          completedTasks,
          incompleteTasks: totalTasks - completedTasks,
        },

        recentProjects: recentProjectsData,

        recentTasks,
      },
    };
  }
}
