import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import {
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity.js';
import { FraudFlagType } from '../../common/enums/fraud-flag-type.enum.js';
import { FraudFlagStatus } from '../../common/enums/fraud-flag-status.enum.js';
import { FraudSeverity } from '../../common/enums/fraud-severity.enum.js';

@Entity('fraud_flags')
export class FraudFlag {
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
  name: 'user_id',
  referencedColumnName: 'id',
})
user: User | null;

  @Column({
    name: 'claim_id',
    type: 'uuid',
    nullable: true,
  })
  claimId: string | null;

  @Column({
    name: 'found_item_id',
    type: 'uuid',
    nullable: true,
  })
  foundItemId: string | null;

  @Column({
    name: 'flag_type',
    type: 'enum',
    enum: FraudFlagType,
    enumName: 'fraud_flag_type_enum',
  })
  flagType: FraudFlagType;

  @Column({
    type: 'enum',
    enum: FraudSeverity,
    enumName: 'fraud_severity_enum',
  })
  severity: FraudSeverity;

  @Column({
    type: 'enum',
    enum: FraudFlagStatus,
    enumName: 'fraud_flag_status_enum',
    default: FraudFlagStatus.OPEN,
  })
  status: FraudFlagStatus;

  @Column({
    type: 'text',
  })
  description: string;

  @ManyToOne(
  () => User,
  {
    nullable: true,
    onDelete: 'SET NULL',
  },
)
@JoinColumn({
  name: 'reviewed_by_admin_id',
  referencedColumnName: 'id',
})
reviewedByAdmin: User | null;

  @Column({
    name: 'reviewed_at',
    type: 'timestamptz',
    nullable: true,
  })
  reviewedAt: Date | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}