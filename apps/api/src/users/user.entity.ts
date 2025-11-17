import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

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
  uid: string | null; // pode deixar opcional se for usar Firebase depois

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar' })
  role: string;

  @CreateDateColumn()
  created_at: Date;
}
