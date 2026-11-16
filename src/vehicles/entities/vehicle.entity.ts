import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AppBaseEntity } from '../../common/entities/app-base.entity.js';
import { TransportRoute } from '../../routes/entities/transport-route.entity.js';

@Entity('vehicles')
export class Vehicle extends AppBaseEntity {
  @Column({
    name: 'vehicle_number',
    type: 'varchar',
    length: 30,
    unique: true,
  })
  vehicleNumber: string;

  @Column({
    name: 'vehicle_type',
    type: 'varchar',
    length: 50,
  })
  vehicleType: string;

  @ManyToOne(
    () => TransportRoute,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'route_id',
    referencedColumnName: 'id',
  })
  route: TransportRoute;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;
}