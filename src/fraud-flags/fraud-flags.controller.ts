import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { FraudFlagsService } from './fraud-flags.service.js';
import { ReviewFraudFlagDto } from './dto/review-fraud-flag.dto.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface.js';

@Controller('fraud-flags')
@Roles(UserRole.ADMIN)
export class FraudFlagsController {
  constructor(
    private readonly fraudFlagsService: FraudFlagsService,
  ) {}

  @Get()
  findAll() {
    return this.fraudFlagsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.fraudFlagsService.findOne(id);
  }

  @Patch(':id/review')
  review(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewDto: ReviewFraudFlagDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.fraudFlagsService.review(
      id,
      reviewDto,
      admin,
    );
  }
}