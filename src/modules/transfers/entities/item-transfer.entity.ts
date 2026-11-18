import { Column, Entity } from 'typeorm';
import { AppBaseEntity } from '../../../common/entities/app-base.entity.js';
import { TransferStatus } from '../../../common/enums/transfer-status.enum.js';

@Entity('item_transfers')
export class ItemTransferEntity extends AppBaseEntity {
  @Column({ type: 'uuid', name: 'found_item_id' })
  foundItemId: string;

  @Column({ type: 'varchar', length: 100, name: 'from_station' })
  fromStation: string;

  @Column({ type: 'varchar', length: 100, name: 'to_station' })
  toStation: string;

  @Column({ type: 'uuid', name: 'initiated_by_staff_id' })
  initiatedByStaffId: string;

  @Column({ type: 'uuid', nullable: true, name: 'received_by_staff_id' })
  receivedByStaffId: string;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.PENDING,
  })
  status: TransferStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;
}