import {
  Column,
  Entity,
} from 'typeorm';

import { AppBaseEntity } from '../../common/entities/app-base.entity.js';

@Entity('item_categories')
export class ItemCategory extends AppBaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;
}