import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  Index,
  type ValueTransformer,
} from 'typeorm';
import { Guild } from '../guilds/guild.entity';
import type { FinanceOperationEntry } from './finance-operation-entry.entity';

export const OPERATION_CATEGORIES = [
  'flip',
  'craft',
  'refine',
  'transport',
  'gathering',
  'other',
] as const;
export type OperationCategory = (typeof OPERATION_CATEGORIES)[number];

export const OPERATION_STATUSES = ['open', 'sold', 'cancelled'] as const;
export type OperationStatus = (typeof OPERATION_STATUSES)[number];

// Postgres devolve bigint como string; prata passa fácil de 2 bilhões
export const bigintToNumber: ValueTransformer = {
  to: (v: number | null | undefined) => v,
  from: (v: string | null) => (v === null ? null : Number(v)),
};

/**
 * Uma operação de compra com objetivo de lucro (flip de mercado, craft,
 * refino, transporte...). Os valores de dinheiro vêm dos movimentos
 * (entries); cost/fees/actual_revenue/sold_quantity são totais mantidos
 * pelo serviço para listar e resumir sem somar tudo de novo.
 */
@Entity('finance_operations')
@Index(['guild', 'status'])
export class FinanceOperation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Guild, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @Column({ name: 'title', type: 'varchar', length: 120 })
  title: string;

  @Column({ name: 'category', type: 'varchar', default: 'other' })
  category: OperationCategory;

  /** Unidades compradas no total */
  @Column({ name: 'quantity', type: 'integer', default: 1 })
  quantity: number;

  /** Soma das saídas de compra */
  @Column({
    name: 'cost',
    type: 'bigint',
    default: 0,
    transformer: bigintToNumber,
  })
  cost: number;

  /** Soma das saídas de taxa: mercado, setup, estação, transporte */
  @Column({
    name: 'fees',
    type: 'bigint',
    default: 0,
    transformer: bigintToNumber,
  })
  fees: number;

  /** Taxa do mercado em % (ex: 6.5), descontada de cada venda */
  @Column({
    name: 'fee_rate',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: {
      to: (v: number | null | undefined) => v,
      from: (v: string | null) => (v === null ? 0 : Number(v)),
    },
  })
  fee_rate: number;

  /** Soma da taxa do mercado já descontada das vendas */
  @Column({
    name: 'market_tax',
    type: 'bigint',
    default: 0,
    transformer: bigintToNumber,
  })
  market_tax: number;

  /** Quanto se esperava receber vendendo tudo (bruto, antes da taxa) */
  @Column({
    name: 'expected_revenue',
    type: 'bigint',
    transformer: bigintToNumber,
  })
  expected_revenue: number;

  /** Soma das entradas de venda até agora, já sem a taxa do mercado */
  @Column({
    name: 'actual_revenue',
    type: 'bigint',
    nullable: true,
    transformer: bigintToNumber,
  })
  actual_revenue: number | null;

  /** Unidades já vendidas (soma das quantidades das entradas) */
  @Column({ name: 'sold_quantity', type: 'integer', default: 0 })
  sold_quantity: number;

  @Column({ name: 'status', type: 'varchar', default: 'open' })
  status: OperationStatus;

  @Column({ name: 'purchased_at', type: 'timestamp', default: () => 'now()' })
  purchased_at: Date;

  /** Data em que a operação foi encerrada */
  @Column({ name: 'sold_at', type: 'timestamp', nullable: true })
  sold_at: Date | null;

  @Column({ name: 'note', type: 'varchar', length: 500, nullable: true })
  note: string | null;

  @Column({ name: 'created_by_id', type: 'integer', nullable: true })
  created_by_id: number | null;

  @Column({ name: 'created_by_name', type: 'varchar', nullable: true })
  created_by_name: string | null;

  @OneToMany('FinanceOperationEntry', 'operation')
  entries?: FinanceOperationEntry[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deleted_at?: Date;
}
