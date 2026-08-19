import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { Task } from 'src/tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember, Task])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
