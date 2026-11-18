
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemMatch } from './entities/item-match.entity.js';
import { LostItem } from '../lost-items/entities/lost-item.entity.js';
import { FoundItemEntity } from '../modules/found-items/entities/found-item.entity.js';

import { MatchesController } from './matches.controller.js';
import { MatchesService } from './matches.service.js';
import { FoundItemPrivateAttribute } from '../modules/found-items/entities/found-item-private-attribute.entity.js';

@Module({
  imports: [
  TypeOrmModule.forFeature([
    ItemMatch,
    LostItem,
    FoundItemEntity,
    FoundItemPrivateAttribute,
  ]),
],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
