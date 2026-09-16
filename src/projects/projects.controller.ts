import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create project',
    description: 'Creates a new project and assigns current user as owner.',
  })
  @ApiBody({
    type: CreateProjectDto,
    examples: {
      project: {
        summary: 'Create project example',
        value: {
          title: 'FlowBoard',
          description: 'Project management application',
          background: 'ocean',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
  })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.create(createProjectDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user projects',
    description: 'Returns projects where current user is a member.',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects returned successfully',
  })
  findAll(@CurrentUser() user: User) {
    return this.projectsService.findAll(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get project details',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Project id',
  })
  @ApiResponse({
    status: 200,
    description: 'Project details returned successfully',
  })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update project',
    description: 'Only project owner can update project.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiBody({
    type: UpdateProjectDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete project',
    description: 'Only project owner can delete project.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.projectsService.remove(id, user);
  }
}
