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
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from '@/users/entities/user.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create project invitation',
    description: 'Owner can invite an existing user to join a project.',
  })
  @ApiBody({
    type: CreateInvitationDto,
    examples: {
      invitation: {
        summary: 'Create invitation example',
        value: {
          projectId: 1,
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
  })
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: User,
  ) {
    return this.invitationsService.create(createInvitationDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get pending invitations',
    description: 'Returns all pending invitations received by current user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending invitations',
  })
  findAll(@CurrentUser() user: User) {
    return this.invitationsService.findAll(user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accept or reject invitation',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Invitation id',
  })
  @ApiBody({
    type: UpdateInvitationDto,
    examples: {
      accept: {
        summary: 'Accept invitation',
        value: {
          action: 'accept',
        },
      },
      reject: {
        summary: 'Reject invitation',
        value: {
          action: 'reject',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation status changed successfully',
  })
  changeStatus(
    @Param('id') id: string,
    @Body() updateInvitationDto: UpdateInvitationDto,
    @CurrentUser() user: User,
  ) {
    return this.invitationsService.changeStatus(+id, updateInvitationDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove invitation',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Invitation id',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation removed successfully',
  })
  remove(@Param('id') id: string) {
    return this.invitationsService.remove(+id);
  }
}
