import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Build } from './build.entity';
import { User } from '../users/user.entity';

@Entity('build_votes')
@Unique(['build', 'user'])
export class BuildVote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Build, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'build_id' })
  build: Build;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
