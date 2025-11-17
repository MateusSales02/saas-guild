import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Guild } from '../guilds/guild.entity';

@Entity('finance_transactions')
export class FinanceTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Guild, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @Column({ name: 'type', type: 'varchar' })
  type: 'in' | 'out';

  @Column({ name: 'amount', type: 'integer' })
  amount: number;

  @Column({ name: 'note', type: 'varchar', nullable: true })
  note?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'now()',
  })
  created_at: Date;
}
