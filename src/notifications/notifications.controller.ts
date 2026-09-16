import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create notification for user',
    description: 'Creates a notification assigned to a specific user.',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Target user id',
  })
  @ApiBody({
    type: CreateNotificationDto,
    examples: {
      notification: {
        summary: 'Notification example',
        value: {
          type: 'TASK_ASSIGNMENT',
          message: 'You were assigned to a task',
          subject: 'FlowBoard Project',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Param('id') id: string,
  ) {
    return this.notificationsService.create(+id, createNotificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user notifications and invitations',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns notifications and pending invitations',
  })
  findAll(@CurrentUser() user: User) {
    return this.notificationsService.findAll(user);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark all notifications as read',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  readAll(@CurrentUser() user: User) {
    return this.notificationsService.readAll(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mark notification as read',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Notification id',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
  })
  update(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.notificationsService.update(user, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete notification',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Notification id',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
