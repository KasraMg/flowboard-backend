import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { ReorderTasksDto } from './dto/reorder-task-dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':taskId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  remove(@Param('taskId') taskId: string, @CurrentUser() user: User) {
    return this.tasksService.remove(+taskId, user);
  }
}
