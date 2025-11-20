import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('build_items')
export class BuildItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  slot?: string;

  @Column({ nullable: true })
  rarity?: string;

  @CreateDateColumn()
  created_at: Date;
}
