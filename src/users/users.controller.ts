import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('sidebar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSidebar(@CurrentUser() user: User) {
    return this.userService.getSidebar(user);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateUser(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: User) {
    return this.userService.updateUser(user, updateUserDto);
  }

  @Patch('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  updateAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(user, file);
  }
}
