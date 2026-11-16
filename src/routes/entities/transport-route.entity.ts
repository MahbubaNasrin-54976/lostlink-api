import {
  Column,
  Entity,
} from 'typeorm';

import { AppBaseEntity } from '../../common/entities/app-base.entity.js';

@Entity('transport_routes')
export class TransportRoute extends AppBaseEntity {
  @Column({
    name: 'route_code',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  routeCode: string;

  @Column({
    name: 'route_name',
    type: 'varchar',
    length: 100,
  })
  routeName: string;

  @Column({
    name: 'start_point',
    type: 'varchar',
    length: 100,
  })
  startPoint: string;

  @Column({
    name: 'end_point',
    type: 'varchar',
    length: 100,
  })
  endPoint: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;
}