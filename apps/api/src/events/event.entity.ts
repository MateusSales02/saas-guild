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
  title: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column()
  type: string; // RAID, GATHERING, DUNGEON, PVP

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(
    () => EventParticipant,
    (participant: EventParticipant) => participant.event,
  )
  participants: EventParticipant[];
}
