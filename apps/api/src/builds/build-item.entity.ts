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

  @Column({ nullable: true })
  albion_id?: string;

  @Column({ nullable: true })
  item_id?: string;

  @CreateDateColumn()
  created_at: Date;
}
