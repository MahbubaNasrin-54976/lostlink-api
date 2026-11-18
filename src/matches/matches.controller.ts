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

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  findAll(@Query() query: QueryMatchDto) {
    return this.matchesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchesService.findOne(id);
  }

  @Patch(':id/dismiss')
  dismiss(@Param('id', ParseUUIDPipe) id: string) {
    return this.matchesService.dismiss(id);
  }
}