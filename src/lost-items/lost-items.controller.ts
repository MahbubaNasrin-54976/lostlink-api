import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LostItemsService } from './lost-items.service.js';
import { CreateLostItemDto } from './dto/create-lost-item.dto.js';
import { UpdateLostItemDto } from './dto/update-lost-item.dto.js';
import { QueryLostItemDto } from './dto/query-lost-item.dto.js';

@Controller('lost-items')
export class LostItemsController {
  constructor(private readonly lostItemsService: LostItemsService) {}

  @Post()
  create(@Body() createLostItemDto: CreateLostItemDto) {
    return this.lostItemsService.create(createLostItemDto);
  }

  @Get()
  findAll(@Query() query: QueryLostItemDto) {
    return this.lostItemsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lostItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLostItemDto: UpdateLostItemDto,
  ) {
    return this.lostItemsService.update(id, updateLostItemDto);
  }

  @Patch(':id/close')
  closeReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.lostItemsService.closeReport(id);
  }
}