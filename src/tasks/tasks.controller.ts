import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { ReorderTasksDto } from './dto/reorder-task-dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: Express.Request) {
    return this.tasksService.create(createTaskDto, req.user as User);
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
    @Req() req: Express.Request,
  ) {
    return this.tasksService.update(+taskId, updateTaskDto, req.user as User);
  }

  @Patch('reorder/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  reorder(
    @Param('projectId') projectId: number,
    @Body() reorderTasksDto: ReorderTasksDto,
    @Req() req: Express.Request,
  ) {
    return this.tasksService.reorder(
      projectId,
      reorderTasksDto,
      req.user as User,
    );
  }

  @Delete(':taskId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('taskId') taskId: string, @Req() req: Express.Request) {
    return this.tasksService.remove(+taskId, req.user as User);
  }
}
