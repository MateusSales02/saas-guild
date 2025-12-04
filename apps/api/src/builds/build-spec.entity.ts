import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BuildClass } from './build-class.entity';

@Entity('build_specs')
export class BuildSpec {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => BuildClass, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: BuildClass;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
