import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum InvitationAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export class UpdateInvitationDto {
  @ApiProperty({
    enum: InvitationAction,
    example: InvitationAction.ACCEPT,
    description: 'Action to apply on invitation',
  })
  @IsEnum(InvitationAction)
  action!: InvitationAction;
}
