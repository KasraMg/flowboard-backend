import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  create(createTaskDto: CreateTaskDto) {
    const task = this.taskRepository.create({
      ...createTaskDto,
      user: {
        id: createTaskDto.userId,
      },
    });

    return this.taskRepository.save(task);
  }

  findAll() {
    return this.taskRepository.find({
      relations: {
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.taskRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.taskRepository.update(id, updateTaskDto);

    return this.findOne(id);
  }

  remove(id: number) {
    return this.taskRepository.delete(id);
  }
}
