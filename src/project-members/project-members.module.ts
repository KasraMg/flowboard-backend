import { Module } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/projects/entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember])],
  controllers: [ProjectMembersController],
  providers: [ProjectMembersService],
})
export class ProjectMembersModule {}
