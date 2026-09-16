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
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: User,
  ) {
    return this.invitationsService.create(createInvitationDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@CurrentUser() user: User) {
    return this.invitationsService.findAll(user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changeStatus(
    @Param('id') id: string,
    @Body() updateInvitationDto: UpdateInvitationDto,
    @CurrentUser() user: User,
  ) {
    return this.invitationsService.changeStatus(+id, updateInvitationDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationsService.remove(+id);
  }
}
