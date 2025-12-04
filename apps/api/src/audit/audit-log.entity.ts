import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'VIEW';

@Entity('audit_logs')
@Index(['user_id', 'created_at'])
@Index(['entity_type', 'entity_id'])
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number | null;

  @Column({ type: 'varchar', nullable: true })
  user_email: string | null;

  @Column({ type: 'varchar' })
  action: AuditAction;

  @Column({ type: 'varchar' })
  entity_type: string;

  @Column({ type: 'int', nullable: true })
  entity_id: number | null;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  old_values: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  new_values: Record<string, unknown> | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address: string | null;

  @Column({ type: 'varchar', nullable: true })
  user_agent: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
