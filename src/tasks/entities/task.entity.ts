import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

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
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority!: 'low' | 'medium' | 'high';

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dueDate!: Date | null;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user!: User;
}
