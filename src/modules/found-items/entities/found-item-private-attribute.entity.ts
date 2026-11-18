
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { AppBaseEntity } from '../../../common/entities/app-base.entity.js';
import { FoundItemEntity } from './found-item.entity.js';

@Entity('found_item_private_attributes')
@Index(
  'UQ_found_item_private_question_number',
  ['foundItemId', 'questionNumber'],
  { unique: true },
)
export class FoundItemPrivateAttribute extends AppBaseEntity {
  @Column({ name: 'found_item_id', type: 'uuid' })
  foundItemId: string;

  @ManyToOne(
    () => FoundItemEntity,
    (foundItem) => foundItem.privateAttributes,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'found_item_id', referencedColumnName: 'id' })
  foundItem: Relation<FoundItemEntity>;

  @Column({ name: 'question_number', type: 'smallint' })
  questionNumber: number;

  @Column({ type: 'varchar', length: 250 })
  question: string;

  @Column({
    name: 'answer_hash',
    type: 'varchar',
    length: 64,
    select: false,
  })
  answerHash: string;
}
