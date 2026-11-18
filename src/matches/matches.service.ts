import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemMatch } from './entities/item-match.entity.js';
import { LostItem } from '../lost-items/entities/lost-item.entity.js';
import { QueryMatchDto, CreateMatchDto } from './dto/query-match.dto.js';
import { MatchStatus } from '../common/enums/match-status.enum.js';
import { LostItemStatus } from '../common/enums/lost-item-status.enum.js';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(ItemMatch)
    private readonly matchRepository: Repository<ItemMatch>,
    @InjectRepository(LostItem)
    private readonly lostItemRepository: Repository<LostItem>,
  ) {}

  async create(dto: CreateMatchDto) {
    const lostItem = await this.lostItemRepository.findOne({
      where: { id: dto.lostItemId },
    });

    if (!lostItem) {
      throw new NotFoundException('Lost item not found');
    }

    const categoryScore = Number(dto.categoryScore ?? 30);
    const routeScore = Number(dto.routeScore ?? 20);
    const timeScore = Number(dto.timeScore ?? 15);
    const locationScore = Number(dto.locationScore ?? 15);
    const descriptionScore = Number(dto.descriptionScore ?? 10);

    const totalScore =
      categoryScore +
      routeScore +
      timeScore +
      locationScore +
      descriptionScore;

    const match = this.matchRepository.create({
      lostItemId: dto.lostItemId,
      foundItemId: dto.foundItemId,
      categoryScore,
      routeScore,
      timeScore,
      locationScore,
      descriptionScore,
      totalScore,
      status: MatchStatus.SUGGESTED,
      algorithmVersion: dto.algorithmVersion ?? 'v1.0',
    });

    const savedMatch = await this.matchRepository.save(match);

    if (lostItem.status === LostItemStatus.OPEN) {
      lostItem.status = LostItemStatus.MATCHED;
      await this.lostItemRepository.save(lostItem);
    }

    return savedMatch;
  }

  async findAll(query: QueryMatchDto) {
    const { page = 1, limit = 10, lostItemId, status } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (lostItemId) where.lostItemId = lostItemId;
    if (status) where.status = status;

    const [data, total] = await this.matchRepository.findAndCount({
      where,
      relations: { lostItem: true },
      order: { totalScore: 'DESC' },
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
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: { lostItem: true },
    });

    if (!match) {
      throw new NotFoundException('Item match not found');
    }

    if (match.status === MatchStatus.SUGGESTED) {
      match.status = MatchStatus.VIEWED;
      await this.matchRepository.save(match);
    }

    return match;
  }

  async dismiss(id: string) {
    const match = await this.findOne(id);
    match.status = MatchStatus.DISMISSED;
    await this.matchRepository.save(match);

    return {
      message: 'Match dismissed successfully',
      match,
    };
  }
}