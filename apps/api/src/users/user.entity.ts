import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  type FindOptionsSelect,
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

  // Nunca carregado por padrão (nem em relações como build.author);
  // quem precisa do hash pede explicitamente com USER_SELECT_WITH_PASSWORD
  @Column({ type: 'varchar', select: false })
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

/** Todas as colunas do usuário, incluindo o hash da senha (só para login) */
export const USER_SELECT_WITH_PASSWORD: FindOptionsSelect<User> = {
  id: true,
  email: true,
  password_hash: true,
  uid: true,
  nickname: true,
  role: true,
  created_at: true,
  updated_at: true,
};
