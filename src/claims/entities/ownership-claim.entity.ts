
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { ItemMatch } from '../../matches/entities/item-match.entity.js';
import { User } from '../../users/entities/user.entity.js';

import {
  ClaimStatus,
  VerificationStatus,
} from '../../common/enums/claim-status.enum.js';

@Entity('ownership_claims')
export class OwnershipClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @ManyToOne(() => ItemMatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'match_id', referencedColumnName: 'id' })
  match: ItemMatch;

  // Passenger relationship
  @Column({ name: 'passenger_id', type: 'uuid' })
  passengerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'passenger_id', referencedColumnName: 'id' })
  passenger: User;

  @Column({
    name: 'claim_status',
    type: 'enum',
    enum: ClaimStatus,
    enumName: 'claim_status_enum',
    default: ClaimStatus.SUBMITTED,
  })
  claimStatus: ClaimStatus;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    enumName: 'verification_status_enum',
    default: VerificationStatus.NOT_STARTED,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'claim_note', type: 'text', nullable: true })
  claimNote: string | null;

  @Column({
    name: 'submitted_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  submittedAt: Date;

  // Admin relationship
  @Column({ name: 'reviewed_by_admin_id', type: 'uuid', nullable: true })
  reviewedByAdminId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'reviewed_by_admin_id',
    referencedColumnName: 'id',
  })
  reviewedByAdmin: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
