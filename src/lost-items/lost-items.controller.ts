
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

import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface.js';

@Controller('lost-items')
export class LostItemsController {
  constructor(private readonly lostItemsService: LostItemsService) {}

  @Post()
  @Roles(UserRole.PASSENGER)
  create(
    @Body() createLostItemDto: CreateLostItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lostItemsService.create(createLostItemDto, user.id);
  }

  @Get()
  @Roles(UserRole.PASSENGER, UserRole.STAFF, UserRole.ADMIN)
  findAll(
    @Query() query: QueryLostItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lostItemsService.findAll(query, user);
  }

  @Get(':id')
  @Roles(UserRole.PASSENGER, UserRole.STAFF, UserRole.ADMIN)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lostItemsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.PASSENGER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLostItemDto: UpdateLostItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lostItemsService.update(
      id,
      updateLostItemDto,
      user.id,
    );
  }

  @Patch(':id/close')
  @Roles(UserRole.PASSENGER)
  closeReport(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.lostItemsService.closeReport(id, user.id);
  }
}
