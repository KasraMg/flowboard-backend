import { IsEnum } from 'class-validator';

export enum InvitationAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export class UpdateInvitationDto {
  @IsEnum(InvitationAction)
  action!: InvitationAction;
}
