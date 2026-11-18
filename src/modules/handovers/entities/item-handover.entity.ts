import { Column, Entity } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity.js';
import { HandoverStatus } from '../../../common/enums/handover-status.enum.js';

@Entity('item_handovers')
export class ItemHandoverEntity extends AppBaseEntity {
  @Column({ type: 'uuid', name: 'found_item_id' })
  foundItemId: string;

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