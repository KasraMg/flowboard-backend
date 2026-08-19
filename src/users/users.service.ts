import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

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

  async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'User created successfully',
      data: savedUser,
    };
  }
}
