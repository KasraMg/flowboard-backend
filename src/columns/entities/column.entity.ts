import { Project } from '@/projects/entities/project.entity';
import { Task } from '@/tasks/entities/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column as ColumnTypeOrm,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Column {
  @PrimaryGeneratedColumn()
  id!: number;

  @ColumnTypeOrm()
  title!: string;

  @ColumnTypeOrm()
  position!: number;

  @ManyToOne(() => Project, (project) => project.columns, {
    onDelete: 'CASCADE',
  })
  project!: Project;

  @OneToMany(() => Task, (task) => task.column)
  tasks!: Task[];
}
