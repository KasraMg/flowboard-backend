import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReorderTasksDto } from './dto/reorder-task-dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create task',
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
  })
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks',
  })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task by id',
  })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':taskId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update task',
  })
  update(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(+taskId, updateTaskDto, user);
  }

  @Patch('reorder/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reorder tasks',
    description: 'Move task between columns or change task order',
  })
  reorder(
    @Param('projectId') projectId: number,
    @Body() reorderTasksDto: ReorderTasksDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.reorder(projectId, reorderTasksDto, user);
  }

  @Delete(':taskId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete task',
  })
  remove(@Param('taskId') taskId: string, @CurrentUser() user: User) {
    return this.tasksService.remove(+taskId, user);
  }
}
