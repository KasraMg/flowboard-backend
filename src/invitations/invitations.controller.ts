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
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req: Express.Request,
  ) {
    return this.invitationsService.create(
      createInvitationDto,
      req.user as User,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Req() req: Express.Request) {
    return this.invitationsService.findAll(req.user as User);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  changeStatus(
    @Param('id') id: string,
    @Body() updateInvitationDto: UpdateInvitationDto,
    @Req() req: Express.Request,
  ) {
    return this.invitationsService.changeStatus(
      +id,
      updateInvitationDto,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      req.user as User,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invitationsService.remove(+id);
  }
}
