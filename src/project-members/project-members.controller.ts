import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Project Members')
@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all project members',
    description:
      'Returns all project members. Mostly for internal/admin usage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all project members',
  })
  findAll() {
    return this.projectMembersService.findAll();
  }

  @Get(':projectId/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get project members',
    description:
      'Returns members of a project if current user belongs to the project.',
  })
  @ApiParam({
    name: 'projectId',
    example: 1,
    description: 'Project id',
  })
  @ApiResponse({
    status: 200,
    description: 'Project members returned successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not a member of project',
  })
  findProjectMembers(
    @Param('projectId', ParseIntPipe) projectId: number,
    @CurrentUser() user: User,
  ) {
    return this.projectMembersService.findProjectMembers(projectId, user);
  }

  @Delete(':projectId/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove user from project',
    description: 'Only project owner can remove a member.',
  })
  @ApiParam({
    name: 'projectId',
    example: 1,
  })
  @ApiParam({
    name: 'userId',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'User removed successfully',
  })
  removeUser(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User,
  ) {
    return this.projectMembersService.removeUser(projectId, userId, user);
  }
}
