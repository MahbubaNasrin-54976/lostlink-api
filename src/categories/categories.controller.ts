
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { CategoriesService } from './categories.service.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';

@Controller('categories')
@Roles(UserRole.ADMIN)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.categoriesService.findAll(
      pagination.page,
      pagination.limit,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(
      id,
      updateCategoryDto,
    );
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.deactivate(id);
  }
}
