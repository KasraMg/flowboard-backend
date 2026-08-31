import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getUsers() {
    return this.userRepository.find();
  }
  getUser(id: number) {
    return this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        projects: true,
        assignedTasks: true,
      },
    });
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.userRepository.update(id, dto);
    return this.getUser(id);
  }
}
