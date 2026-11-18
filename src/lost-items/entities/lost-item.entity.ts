import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LostItemStatus } from '../../common/enums/lost-item-status.enum.js';

@Entity('lost_items')
export class LostItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'passenger_id', type: 'uuid' })
  passengerId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'route_id', type: 'uuid', nullable: true })
  routeId: string | null;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string | null;

  @Column({ name: 'station_id', type: 'uuid', nullable: true })
  stationId: string | null;

  @Column({ name: 'item_title', type: 'varchar', length: 150 })
  itemTitle: string;

  @Column({ name: 'item_color', type: 'varchar', length: 50, nullable: true })
  itemColor: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'lost_at', type: 'timestamptz' })
  lostAt: Date;

  @Column({
    type: 'enum',
    enum: LostItemStatus,
    enumName: 'lost_item_status_enum',
    default: LostItemStatus.OPEN,
  })
  status: LostItemStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}