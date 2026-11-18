
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FoundItemsService } from './found-items.service.js';
import { FoundItemsController } from './found-items.controller.js';

import {
  FoundItemEntity,
  FoundItemEvidenceEntity,
} from './entities/found-item.entity.js';

import { FoundItemPrivateAttribute } from './entities/found-item-private-attribute.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoundItemEntity,
      FoundItemEvidenceEntity,
      FoundItemPrivateAttribute,
    ]),
  ],
  controllers: [FoundItemsController],
  providers: [FoundItemsService],
  exports: [FoundItemsService],
})
export class FoundItemsModule {}
