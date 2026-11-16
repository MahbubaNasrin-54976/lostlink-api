import {
  Column,
  Entity,
} from 'typeorm';

import { AppBaseEntity } from '../../common/entities/app-base.entity.js';

@Entity('stations')
export class Station extends AppBaseEntity {
  @Column({
    name: 'station_code',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  stationCode: string;

  @Column({
    name: 'station_name',
    type: 'varchar',
    length: 100,
  })
  stationName: string;

  @Column({
    name: 'location_description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  locationDescription: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;
}