import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
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
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  event_date: Date;

  @Column({ default: false })
  recurring: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(
    () => EventParticipant,
    (participant: EventParticipant) => participant.event,
  )
  participants: EventParticipant[];
}
