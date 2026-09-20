import { Project } from '@/projects/entities/project.entity';
import { User } from '@/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Project, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;
}
