
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { LostItemStatus } from '../../common/enums/lost-item-status.enum.js';

import { User } from '../../users/entities/user.entity.js';
import { ItemCategory } from '../../categories/entities/item-category.entity.js';
import { TransportRoute } from '../../routes/entities/transport-route.entity.js';
import { Vehicle } from '../../vehicles/entities/vehicle.entity.js';
import { Station } from '../../stations/entities/station.entity.js';

@Entity('lost_items')
export class LostItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Passenger Relationship
  @Column({ name: 'passenger_id', type: 'uuid' })
  passengerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  // Category Relationship
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => ItemCategory, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: ItemCategory;

  // Route Relationship
  @Column({ name: 'route_id', type: 'uuid', nullable: true })
  routeId: string | null;

  @ManyToOne(() => TransportRoute, { nullable: true })
  @JoinColumn({ name: 'route_id' })
  route: TransportRoute | null;

  // Vehicle Relationship
  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId: string | null;

  @ManyToOne(() => Vehicle, { nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle | null;

  // Station Relationship
  @Column({ name: 'station_id', type: 'uuid', nullable: true })
  stationId: string | null;

  @ManyToOne(() => Station, { nullable: true })
  @JoinColumn({ name: 'station_id' })
  station: Station | null;

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
