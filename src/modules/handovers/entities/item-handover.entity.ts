
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { AppBaseEntity } from '../../../common/entities/app-base.entity.js';
import { HandoverStatus } from '../../../common/enums/handover-status.enum.js';

import { FoundItemEntity } from '../../found-items/entities/found-item.entity.js';
import { User } from '../../../users/entities/user.entity.js';

@Entity('item_handovers')
export class ItemHandoverEntity extends AppBaseEntity {
  @Column({ type: 'uuid', name: 'found_item_id' })
  foundItemId: string;

  @ManyToOne(() => FoundItemEntity, { nullable: false })
  @JoinColumn({ name: 'found_item_id', referencedColumnName: 'id' })
  foundItem: FoundItemEntity;

  @Column({ type: 'varchar', length: 150, name: 'passenger_name' })
  passengerName: string;

  @Column({ type: 'varchar', length: 150, name: 'passenger_email' })
  passengerEmail: string;

  @Column({ type: 'varchar', length: 50, name: 'passenger_phone' })
  passengerPhone: string;

  @Column({ type: 'varchar', length: 100, name: 'verification_code' })
  verificationCode: string;

  @Column({ type: 'uuid', name: 'processed_by_staff_id' })
  processedByStaffId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'processed_by_staff_id',
    referencedColumnName: 'id',
  })
  processedByStaff: User;

  @Column({
    type: 'enum',
    enum: HandoverStatus,
    default: HandoverStatus.PENDING,
  })
  status: HandoverStatus;

  @Column({ type: 'text', nullable: true, name: 'signature_url' })
  signatureUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
