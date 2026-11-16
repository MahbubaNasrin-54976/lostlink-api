
import {
  Column,
  DeleteDateColumn,
  Entity,
} from 'typeorm';

import { AppBaseEntity } from '../../common/entities/app-base.entity.js';
import { UserRole } from '../../common/enums/user-role.enum.js';

@Entity('users')
export class User extends AppBaseEntity {
  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 100,
  })
  fullName: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  phone: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    select: false,
  })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.PASSENGER,
  })
  role: UserRole;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date | null;
}
