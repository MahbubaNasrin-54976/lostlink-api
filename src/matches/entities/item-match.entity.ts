import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LostItem } from '../../lost-items/entities/lost-item.entity.js';
import { MatchStatus } from '../../common/enums/match-status.enum.js';

@Entity('item_matches')
export class ItemMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lost_item_id', type: 'uuid' })
  lostItemId: string;

  @ManyToOne(() => LostItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lost_item_id', referencedColumnName: 'id' })
  lostItem: LostItem;

  @Column({ name: 'found_item_id', type: 'uuid' })
  foundItemId: string;

  @Column({
    name: 'category_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  categoryScore: number;

  @Column({
    name: 'route_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  routeScore: number;

  @Column({
    name: 'time_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  timeScore: number;

  @Column({
    name: 'location_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  locationScore: number;

  @Column({
    name: 'description_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  descriptionScore: number;

  @Column({
    name: 'total_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  totalScore: number;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    enumName: 'match_status_enum',
    default: MatchStatus.SUGGESTED,
  })
  status: MatchStatus;

  @Column({
    name: 'algorithm_version',
    type: 'varchar',
    length: 20,
    default: 'v1.0',
  })
  algorithmVersion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}