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
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Param('id') id: string,
  ) {
    return this.notificationsService.create(+id, createNotificationDto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOne(@Req() req: Express.Request) {
    return this.notificationsService.findAll(req.user as User);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  readAll(@Req() req: Express.Request) {
    return this.notificationsService.readAll(req.user as User);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Req() req: Express.Request) {
    return this.notificationsService.update(req.user as User, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
