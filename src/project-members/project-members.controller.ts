import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Get()
  findAll() {
    return this.projectMembersService.findAll();
  }

  @Get(':projectId/members')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'projectId',
    type: Number,
  })
  @ApiBearerAuth()
  findOne(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: User,
  ) {
    return this.projectMembersService.findProjectMembers(projectId, user);
  }

  @Delete(':projectId/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'projectId',
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    type: Number,
  })
  @ApiBearerAuth()
  removeUser(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    return this.projectMembersService.removeUser(projectId, userId, user);
  }
}
