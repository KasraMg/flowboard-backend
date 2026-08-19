import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Column } from 'src/columns/entities/column.entity';
import { Project } from 'src/projects/entities/project.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Column, Project, ProjectMember]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
