
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { AppBaseEntity } from '../../../common/entities/app-base.entity.js';
import { FoundItemStatus } from '../../../common/enums/found-item-status.enum.js';
import { EvidenceType } from '../../../common/enums/evidence-type.enum.js';
import { FoundItemPrivateAttribute } from './found-item-private-attribute.entity.js';

@Entity('found_items')
export class FoundItemEntity extends AppBaseEntity {
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 100, name: 'found_location' })
  foundLocation: string;

  @Column({
    type: 'timestamptz',
    name: 'found_at',
  })
  foundAt: Date;

  @Column({
    type: 'enum',
    enum: FoundItemStatus,
    default: FoundItemStatus.REGISTERED,
  })
  status: FoundItemStatus;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'storage_location',
  })
  storageLocation: string;

  @Column({ type: 'uuid', name: 'registered_by_staff_id' })
  registeredByStaffId: string;

  @OneToMany(
    () => FoundItemEvidenceEntity,
    (evidence) => evidence.foundItem,
    { cascade: true },
  )
  evidence: Relation<FoundItemEvidenceEntity[]>;

  @OneToMany(
    () => FoundItemPrivateAttribute,
    (attribute) => attribute.foundItem,
    { cascade: true },
  )
  privateAttributes: Relation<FoundItemPrivateAttribute[]>;
}

@Entity('found_item_evidence')
export class FoundItemEvidenceEntity extends AppBaseEntity {
  @Column({ type: 'uuid', name: 'found_item_id' })
  foundItemId: string;

  @ManyToOne(() => FoundItemEntity, (item) => item.evidence, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'found_item_id' })
  foundItem: Relation<FoundItemEntity>;

  @Column({
    type: 'enum',
    enum: EvidenceType,
    default: EvidenceType.PHOTO,
  })
  type: EvidenceType;

  @Column({ type: 'text', name: 'file_url' })
  fileUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
