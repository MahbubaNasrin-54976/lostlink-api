import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  Repository,
  QueryFailedError,
} from 'typeorm';

import { ItemCategory } from './entities/item-category.entity.js';

import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ItemCategory)
    private readonly categoryRepository: Repository<ItemCategory>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name: createCategoryDto.name,
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Category name already exists',
      );
    }

    const category = this.categoryRepository.create(
      createCategoryDto,
    );

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Category name already exists',
        );
      }

      throw error;
    }
  }

  
async findAll(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [data, total] =
    await this.categoryRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.findOne(id);

    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: {
          name: updateCategoryDto.name,
        },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          'Category name already exists',
        );
      }
    }

    Object.assign(category, updateCategoryDto);

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Category name already exists',
        );
      }

      throw error;
    }
  }

  async deactivate(id: string) {
    const category = await this.findOne(id);

    category.isActive = false;

    await this.categoryRepository.save(category);

    return {
      message: 'Category deactivated successfully',
    };
  }
}