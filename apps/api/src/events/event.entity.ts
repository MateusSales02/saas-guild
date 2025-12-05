import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Guild } from '../guilds/guild.entity';
import { EventParticipant } from './event-participant.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Guild, { eager: true, onDelete: 'CASCADE' })
  guild: Guild;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  type: string; // RAID, GATHERING, DUNGEON, PVP

  @Column({ nullable: true })
  location: string;

  // Campos de recorrência
  @Column({ default: false })
  is_recurring: boolean;

  @Column({ nullable: true })
  recurrence_pattern: string; // 'daily', 'weekly', 'monthly'

  @Column({ nullable: true, type: 'int' })
  recurrence_interval: number; // Ex: 1 = toda semana, 2 = a cada 2 semanas

  @Column({ nullable: true, type: 'date' })
  recurrence_end_date: Date;

  @Column({ nullable: true, type: 'int' })
  parent_event_id: number; // ID do evento pai (se for uma ocorrência)

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @OneToMany(
    () => EventParticipant,
    (participant: EventParticipant) => participant.event,
  )
  participants: EventParticipant[];
}
