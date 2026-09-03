import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { Favorite } from 'src/favorites/entities/favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, ProjectMember, Favorite])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
