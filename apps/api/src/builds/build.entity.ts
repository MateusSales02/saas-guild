import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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
import { GuildMember } from '../guilds/guild-member.entity';

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

  @ManyToOne(() => BuildClass, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'class_id' })
  class?: BuildClass | null;

  @ManyToOne(() => BuildSpec, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
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

  @ManyToOne(() => GuildMember, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'member_id' })
  member?: GuildMember | null;

  @Column({ default: true })
  is_public: boolean;

  @Column({ type: 'int', nullable: true })
  price?: number;

  /** Tipo de conteúdo (ex: "Fama Solo", "ZvZ") */
  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[] | null;

  /** Equipamento, consumíveis, habilidades e características (ids do Albion) */
  @Column({ type: 'jsonb', nullable: true })
  loadout?: Record<string, unknown> | null;

  /** Nome exibido como autor, independente da conta */
  @Column({ name: 'author_name', length: 15, nullable: true })
  author_name?: string;

  /** IDs de vídeos do YouTube */
  @Column({ type: 'jsonb', nullable: true })
  videos?: string[] | null;

  /** 'draft' (rascunho) ou 'published' */
  @Column({ default: 'published' })
  status?: string;

  @Column({ type: 'int', default: 0 })
  vote_count?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
