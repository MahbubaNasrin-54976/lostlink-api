
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

import { MatchesService } from './matches.service.js';
import { QueryMatchDto, CreateMatchDto } from './dto/query-match.dto.js';

import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface.js';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  @Roles(UserRole.PASSENGER, UserRole.STAFF, UserRole.ADMIN)
  findAll(
    @Query() query: QueryMatchDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.matchesService.findAll(query, user);
  }

  @Get(':id')
  @Roles(UserRole.PASSENGER, UserRole.STAFF, UserRole.ADMIN)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.matchesService.findOne(id, user);
  }

  @Patch(':id/dismiss')
  @Roles(UserRole.PASSENGER)
  dismiss(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.matchesService.dismiss(id, user.id);
  }
}
