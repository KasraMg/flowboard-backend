import { Column as ColumnEntity } from 'src/columns/entities/column.entity';
import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum ProjectBackground {
  OCEAN = 'ocean',
  SUNSET = 'sunset',
  PURPLE = 'purple',
  FOREST = 'forest',
  FIRE = 'fire',
  SKY = 'sky',
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  title!: string;

  @Column({
    type: 'text',
    default: '',
  })
  description!: string;

  @Column({
    type: 'enum',
    enum: ProjectBackground,
    default: ProjectBackground.OCEAN,
  })
  background!: ProjectBackground;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt!: Date;

  isFave!: boolean;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status!: ProjectStatus;

  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner!: User;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members!: ProjectMember[];

  @OneToMany(() => ColumnEntity, (column) => column.project)
  columns!: ColumnEntity[];

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];
}
