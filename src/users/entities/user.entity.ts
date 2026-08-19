import { ProjectMember } from 'src/project-members/entities/project-member.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Task } from 'src/tasks/entities/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @ManyToMany(() => Task, (task) => task.assignees)
  assignedTasks!: Task[];

  @OneToMany(() => Project, (project) => project.owner)
  projects!: Project[];

  @OneToMany(() => ProjectMember, (member) => member.user)
  projectMembers!: ProjectMember[];
}
