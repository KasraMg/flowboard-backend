import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

import { ProjectMember } from '../project-members/entities/project-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectMember, Task, Favorite])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
