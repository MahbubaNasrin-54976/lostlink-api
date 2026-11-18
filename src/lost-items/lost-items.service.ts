import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { LostItem } from './entities/lost-item.entity.js';
import { CreateLostItemDto } from './dto/create-lost-item.dto.js';
import { UpdateLostItemDto } from './dto/update-lost-item.dto.js';
import { QueryLostItemDto } from './dto/query-lost-item.dto.js';
import { LostItemStatus } from '../common/enums/lost-item-status.enum.js';

@Injectable()
export class LostItemsService {
  constructor(
    @InjectRepository(LostItem)
    private readonly lostItemRepository: Repository<LostItem>,
  ) {}

  async create(createDto: CreateLostItemDto) {
    const lostItem = this.lostItemRepository.create({
      passengerId: createDto.passengerId,
      categoryId: createDto.categoryId,
      routeId: createDto.routeId ?? null,
      vehicleId: createDto.vehicleId ?? null,
      stationId: createDto.stationId ?? null,
      itemTitle: createDto.itemTitle,
      itemColor: createDto.itemColor ?? null,
      brand: createDto.brand ?? null,
      description: createDto.description,
      lostAt: new Date(createDto.lostAt),
      status: LostItemStatus.OPEN,
    });

    return await this.lostItemRepository.save(lostItem);
  }

  async findAll(query: QueryLostItemDto) {
    const {
      page = 1,
      limit = 10,
      passengerId,
      categoryId,
      routeId,
      status,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const baseFilter: Record<string, unknown> = {};
    if (passengerId) baseFilter.passengerId = passengerId;
    if (categoryId) baseFilter.categoryId = categoryId;
    if (routeId) baseFilter.routeId = routeId;
    if (status) baseFilter.status = status;

    const whereCondition = search
      ? [
          { ...baseFilter, itemTitle: ILike(`%${search}%`) },
          { ...baseFilter, description: ILike(`%${search}%`) },
        ]
      : baseFilter;

    const [data, total] = await this.lostItemRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
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
    const lostItem = await this.lostItemRepository.findOne({
      where: { id },
    });

    if (!lostItem) {
      throw new NotFoundException('Lost item report not found');
    }

    return lostItem;
  }

  async update(id: string, updateDto: UpdateLostItemDto) {
    const lostItem = await this.findOne(id);

    if (
      lostItem.status === LostItemStatus.RESOLVED ||
      lostItem.status === LostItemStatus.CLOSED
    ) {
      throw new BadRequestException(
        'Cannot update a resolved or closed lost item report',
      );
    }

    if (updateDto.lostAt) {
      lostItem.lostAt = new Date(updateDto.lostAt);
    }

    const { lostAt, ...otherFields } = updateDto;
    Object.assign(lostItem, otherFields);

    return await this.lostItemRepository.save(lostItem);
  }

  async closeReport(id: string) {
    const lostItem = await this.findOne(id);
    lostItem.status = LostItemStatus.CLOSED;
    await this.lostItemRepository.save(lostItem);

    return {
      message: 'Lost item report closed successfully',
      lostItem,
    };
  }
}