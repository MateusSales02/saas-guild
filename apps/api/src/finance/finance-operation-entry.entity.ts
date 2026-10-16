import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { FinanceOperation, bigintToNumber } from './finance-operation.entity';

export const ENTRY_KINDS = ['purchase', 'fee', 'sale'] as const;
export type EntryKind = (typeof ENTRY_KINDS)[number];

/**
 * Movimento dentro de uma operação. Compras grandes são refinadas e vendidas
 * aos poucos, então uma operação acumula várias saídas (compra, taxas) e
 * várias entradas (vendas parciais).
 */
@Entity('finance_operation_entries')
@Index(['operation'])
export class FinanceOperationEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FinanceOperation, (op) => op.entries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'operation_id' })
  operation: FinanceOperation;

  /** purchase/fee = saída · sale = entrada (amount é o valor bruto da venda) */
  @Column({ name: 'kind', type: 'varchar' })
  kind: EntryKind;

  @Column({ name: 'amount', type: 'bigint', transformer: bigintToNumber })
  amount: number;

  /** Taxa do mercado descontada desta venda; entra no caixa amount − tax */
  @Column({
    name: 'tax',
    type: 'bigint',
    default: 0,
    transformer: bigintToNumber,
  })
  tax: number;

  /** Unidades compradas ou vendidas neste movimento (opcional) */
  @Column({ name: 'quantity', type: 'integer', nullable: true })
  quantity: number | null;

  @Column({ name: 'note', type: 'varchar', length: 255, nullable: true })
  note: string | null;

  @Column({ name: 'occurred_at', type: 'timestamp', default: () => 'now()' })
  occurred_at: Date;

  /** Lançamento espelhado na tesouraria, se houver */
  @Column({ name: 'tx_id', type: 'integer', nullable: true })
  tx_id: number | null;

  @Column({ name: 'created_by_name', type: 'varchar', nullable: true })
  created_by_name: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;
}
