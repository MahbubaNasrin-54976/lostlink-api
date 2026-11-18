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

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  create(@Body() createClaimDto: CreateClaimDto) {
    return this.claimsService.create(createClaimDto);
  }

  @Get()
  findAll() {
    return this.claimsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.findOne(id);
  }

  @Post(':id/verify')
  verifyClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() verifyClaimDto: VerifyClaimDto,
  ) {
    return this.claimsService.verifyClaim(id, verifyClaimDto);
  }

  @Patch(':id/review')
  reviewClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewClaimDto: ReviewClaimDto,
  ) {
    return this.claimsService.reviewClaim(id, reviewClaimDto);
  }

  @Patch(':id/cancel')
  cancelClaim(@Param('id', ParseUUIDPipe) id: string) {
    return this.claimsService.cancelClaim(id);
  }
}