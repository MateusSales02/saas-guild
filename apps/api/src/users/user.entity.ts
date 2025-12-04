import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

// papéis possíveis dentro do SISTEMA (não confundir com member/leader/officer da guild)
export type UserRole = 'leader' | 'player';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password_hash: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  uid: string | null;

  @Column({ type: 'varchar' })
  nickname: string;

  // agora tipado e com default "leader"
  @Column({ type: 'varchar', default: 'leader' })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
