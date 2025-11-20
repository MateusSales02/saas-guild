import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BuildClass } from './build-class.entity';
import { BuildSpec } from './build-spec.entity';
import { BuildItem } from './build-item.entity';
import { Guild } from '../guilds/guild.entity';
import { User } from '../users/user.entity';

@Entity('builds')
export class Build {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  role?: string;

  @ManyToOne(() => BuildClass, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'class_id' })
  class?: BuildClass | null;

  @ManyToOne(() => BuildSpec, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'spec_id' })
  spec?: BuildSpec | null;

  @ManyToMany(() => BuildItem, { eager: true })
  @JoinTable({
    name: 'build_items_map',
    joinColumn: { name: 'build_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'item_id', referencedColumnName: 'id' },
  })
  items?: BuildItem[];

  @ManyToOne(() => Guild, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'guild_id' })
  guild?: Guild | null;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: User | null;

  @Column({ default: true })
  is_public: boolean;

  @CreateDateColumn()
  created_at: Date;
}
