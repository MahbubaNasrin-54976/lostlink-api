
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { OwnershipClaim } from './ownership-claim.entity.js';

import { FoundItemPrivateAttribute } from '../../modules/found-items/entities/found-item-private-attribute.entity.js';

@Entity('claim_verifications')
export class ClaimVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'claim_id', type: 'uuid' })
  claimId: string;

  @ManyToOne(() => OwnershipClaim, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'claim_id', referencedColumnName: 'id' })
  claim: OwnershipClaim;

  // Private attribute relationship
  @Column({ name: 'private_attribute_id', type: 'uuid' })
  privateAttributeId: string;

  @ManyToOne(() => FoundItemPrivateAttribute, { nullable: false })
  @JoinColumn({
    name: 'private_attribute_id',
    referencedColumnName: 'id',
  })
  privateAttribute: FoundItemPrivateAttribute;

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @Column({ name: 'attempt_number', type: 'int', default: 1 })
  attemptNumber: number;

  @CreateDateColumn({ name: 'answered_at', type: 'timestamptz' })
  answeredAt: Date;
}
