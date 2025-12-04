import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Guild } from './guild.entity';

@Entity('guild_members')
export class GuildMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Guild, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @Column()
  role: string; // líder, oficial, membro

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
