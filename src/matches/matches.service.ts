
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItemMatch } from './entities/item-match.entity.js';
import { LostItem } from '../lost-items/entities/lost-item.entity.js';
import { FoundItemEntity } from '../modules/found-items/entities/found-item.entity.js';

import { QueryMatchDto, CreateMatchDto } from './dto/query-match.dto.js';

import { MatchStatus } from '../common/enums/match-status.enum.js';
import { LostItemStatus } from '../common/enums/lost-item-status.enum.js';
import { UserRole } from '../common/enums/user-role.enum.js';

import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface.js';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(ItemMatch)
    private readonly matchRepository: Repository<ItemMatch>,

    @InjectRepository(LostItem)
    private readonly lostItemRepository: Repository<LostItem>,

    @InjectRepository(FoundItemEntity)
    private readonly foundItemRepository: Repository<FoundItemEntity>,
  ) {}

  async create(dto: CreateMatchDto) {
    const lostItem = await this.lostItemRepository.findOne({
      where: { id: dto.lostItemId },
    });

    if (!lostItem) {
      throw new NotFoundException('Lost item not found');
    }

    const foundItem = await this.foundItemRepository.findOne({
      where: { id: dto.foundItemId },
    });

    if (!foundItem) {
      throw new NotFoundException('Found item not found');
    }

    const categoryScore = Number(dto.categoryScore ?? 30);
    const routeScore = Number(dto.routeScore ?? 20);
    const timeScore = Number(dto.timeScore ?? 15);
    const locationScore = Number(dto.locationScore ?? 15);
    const descriptionScore = Number(dto.descriptionScore ?? 10);

    const scores = [
      categoryScore,
      routeScore,
      timeScore,
      locationScore,
      descriptionScore,
    ];

    if (
      scores.some(
        (score) => !Number.isFinite(score) || score < 0 || score > 100,
      )
    ) {
      throw new BadRequestException(
        'Each match score must be between 0 and 100',
      );
    }

    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    if (totalScore > 100) {
      throw new BadRequestException(
        'Total match score cannot exceed 100',
      );
    }

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

  async findAll(query: QueryMatchDto, user: AuthenticatedUser) {
    const { page = 1, limit = 10, lostItemId, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.lostItem', 'lostItem');

    if (user.role === UserRole.PASSENGER) {
      queryBuilder.andWhere('lostItem.passengerId = :passengerId', {
        passengerId: user.id,
      });
    }

    if (lostItemId) {
      queryBuilder.andWhere('match.lostItemId = :lostItemId', {
        lostItemId,
      });
    }

    if (status) {
      queryBuilder.andWhere('match.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .orderBy('match.totalScore', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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

  async findOne(id: string, user: AuthenticatedUser) {
  const queryBuilder = this.matchRepository
    .createQueryBuilder('match')
    .leftJoinAndSelect('match.lostItem', 'lostItem')
    .where('match.id = :id', { id });

  // Only Passenger needs to receive private questions.
  if (user.role === UserRole.PASSENGER) {
    queryBuilder
      .leftJoinAndSelect('match.foundItem', 'foundItem')
      .leftJoinAndSelect(
        'foundItem.privateAttributes',
        'privateAttribute',
      );
  }

  const match = await queryBuilder.getOne();

  if (!match) {
    throw new NotFoundException('Item match not found');
  }

  if (
    user.role === UserRole.PASSENGER &&
    match.lostItem?.passengerId !== user.id
  ) {
    throw new ForbiddenException(
      'You are not allowed to access this match',
    );
  }

  // Only Passenger viewing a suggested match changes its status.
  if (
    user.role === UserRole.PASSENGER &&
    match.status === MatchStatus.SUGGESTED
  ) {
    match.status = MatchStatus.VIEWED;
    await this.matchRepository.save(match);
  }

  // Return only public question information.
  if (user.role === UserRole.PASSENGER && match.foundItem) {
    return {
      ...match,
      foundItem: {
        ...match.foundItem,
        privateAttributes: (match.foundItem.privateAttributes ?? [])
          .sort((a, b) => a.questionNumber - b.questionNumber)
          .map((attribute) => ({
            id: attribute.id,
            questionNumber: attribute.questionNumber,
            question: attribute.question,
          })),
      },
    };
  }

  return match;
}
  async dismiss(id: string, passengerId: string) {
    const match = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.lostItem', 'lostItem')
      .where('match.id = :id', { id })
      .getOne();

    if (!match) {
      throw new NotFoundException('Item match not found');
    }

    if (match.lostItem?.passengerId !== passengerId) {
      throw new ForbiddenException(
        'You are not allowed to dismiss this match',
      );
    }

    if (
      match.status === MatchStatus.CLAIMED ||
      match.status === MatchStatus.DISMISSED
    ) {
      throw new BadRequestException(
        `Cannot dismiss match in ${match.status} status`,
      );
    }

    match.status = MatchStatus.DISMISSED;
    await this.matchRepository.save(match);

    return {
      message: 'Match dismissed successfully',
      match,
    };
  }
}
