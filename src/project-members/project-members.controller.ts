import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

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
    @Req() req: Express.Request,
  ) {
    return this.projectMembersService.findProjectMembers(
      projectId,
      req.user as User,
    );
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
    @Req() req: Express.Request,
  ) {
    return this.projectMembersService.removeUser(
      projectId,
      userId,
      req.user as User,
    );
  }
}
