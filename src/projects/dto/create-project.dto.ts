import { IsString, MinLength } from 'class-validator';
import { Column } from 'typeorm';

export enum ProjectBackground {
  OCEAN = 'ocean',
  SUNSET = 'sunset',
  PURPLE = 'purple',
  FOREST = 'forest',
  FIRE = 'fire',
  SKY = 'sky',
}

export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @Column({
    type: 'enum',
    enum: ProjectBackground,
    default: ProjectBackground.OCEAN,
  })
  background!: ProjectBackground;
}
