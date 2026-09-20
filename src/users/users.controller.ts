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

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('sidebar')
  @ApiOperation({
    summary: 'Get sidebar data',
  })
  getSidebar(@CurrentUser() user: User) {
    return this.userService.getSidebar(user);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Update current user profile',
  })
  updateUser(@Body() dto: UpdateUserDto, @CurrentUser() user: User) {
    return this.userService.updateUser(user, dto);
  }

  @Patch('me/avatar')
  @ApiOperation({
    summary: 'Update user avatar',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
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
