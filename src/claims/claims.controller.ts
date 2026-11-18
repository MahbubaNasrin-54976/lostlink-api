import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { ClaimsService } from './claims.service.js';
import { CreateClaimDto } from './dto/create-claim.dto.js';
import { VerifyClaimDto } from './dto/verify-claim.dto.js';
import { ReviewClaimDto } from './dto/review-claim.dto.js';

import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface.js';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @Roles(UserRole.PASSENGER)
  create(
    @Body() createClaimDto: CreateClaimDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.claimsService.create(createClaimDto, user.id);
  }

  @Get()
  @Roles(UserRole.PASSENGER, UserRole.ADMIN)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.claimsService.findAll(user);
  }

  @Get(':id')
  @Roles(UserRole.PASSENGER, UserRole.ADMIN)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.claimsService.findOne(id, user);
  }

  @Post(':id/verify')
  @Roles(UserRole.PASSENGER)
  verifyClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() verifyClaimDto: VerifyClaimDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.claimsService.verifyClaim(id, verifyClaimDto, user.id);
  }

  @Patch(':id/review')
  @Roles(UserRole.ADMIN)
  reviewClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewClaimDto: ReviewClaimDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.claimsService.reviewClaim(id, reviewClaimDto, user.id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.PASSENGER)
  cancelClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.claimsService.cancelClaim(id, user.id);
  }
}