import { Column as ColumnEntity } from 'src/columns/entities/column.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

type TaskLabel = {
  title: string;
  backgroundColor: string;
};

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  labels!: TaskLabel[] | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ default: false })
  completed!: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  backgroundColor!: string | null;

  @Column({
    type: 'int',
    default: 0,
  })
  position!: number;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dueDate!: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt!: Date;

  @ManyToMany(() => User, (user) => user.assignedTasks)
  @JoinTable()
  assignees!: User[];

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => ColumnEntity, (column) => column.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'columnId' })
  column!: ColumnEntity;

  @ManyToOne(() => User, (user) => user.createdTasks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'creatorId' })
  creator!: User | null;
}
