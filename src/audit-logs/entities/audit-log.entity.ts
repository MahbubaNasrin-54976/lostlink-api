import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity.js';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => User,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'actor_user_id',
    referencedColumnName: 'id',
  })
  actorUser: User | null;

  @Column({
    type: 'varchar',
    length: 100,
  })
  action: string;

  @Column({
    name: 'entity_name',
    type: 'varchar',
    length: 100,
  })
  entityName: string;

  @Column({
    name: 'entity_id',
    type: 'uuid',
  })
  entityId: string;

  @Column({
    name: 'old_value',
    type: 'jsonb',
    nullable: true,
  })
  oldValue: Record<string, unknown> | null;

  @Column({
    name: 'new_value',
    type: 'jsonb',
    nullable: true,
  })
  newValue: Record<string, unknown> | null;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress: string | null;

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}