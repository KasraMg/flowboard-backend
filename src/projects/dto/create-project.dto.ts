import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum ProjectBackground {
  OCEAN = 'ocean',
  SUNSET = 'sunset',
  PURPLE = 'purple',
  FOREST = 'forest',
  FIRE = 'fire',
  SKY = 'sky',
}

export class CreateProjectDto {
  @ApiProperty({
    example: 'FlowBoard',
    description: 'Project title',
  })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiPropertyOptional({
    example: 'A Trello like project management app',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    enum: ProjectBackground,
    example: ProjectBackground.OCEAN,
    default: ProjectBackground.OCEAN,
  })
  @IsEnum(ProjectBackground)
  background!: ProjectBackground;
}
