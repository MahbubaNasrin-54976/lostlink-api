
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository, EntityManager } from 'typeorm';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { OwnershipClaim } from './entities/ownership-claim.entity.js';
import { ClaimVerification } from './entities/claim-verification.entity.js';
import { ItemMatch } from '../matches/entities/item-match.entity.js';
import { LostItem } from '../lost-items/entities/lost-item.entity.js';
import { FoundItemPrivateAttribute } from '../modules/found-items/entities/found-item-private-attribute.entity.js';

import { CreateClaimDto } from './dto/create-claim.dto.js';
import { VerifyClaimDto } from './dto/verify-claim.dto.js';
import { ReviewClaimDto } from './dto/review-claim.dto.js';

import {
  ClaimStatus,
  VerificationStatus,
} from '../common/enums/claim-status.enum.js';

import { MatchStatus } from '../common/enums/match-status.enum.js';
import { LostItemStatus } from '../common/enums/lost-item-status.enum.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface.js';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(OwnershipClaim)
    private readonly claimRepository: Repository<OwnershipClaim>,

    @InjectRepository(ClaimVerification)
    private readonly verificationRepository: Repository<ClaimVerification>,

    @InjectRepository(ItemMatch)
    private readonly matchRepository: Repository<ItemMatch>,

    @InjectRepository(LostItem)
    private readonly lostItemRepository: Repository<LostItem>,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,
  ) {}

  private hashAnswer(answer: string): Buffer {
    const secret = this.configService.getOrThrow<string>(
      'PRIVATE_ATTRIBUTE_SECRET',
    );

    const normalizedAnswer = answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

    if (!normalizedAnswer) {
      throw new BadRequestException('Answer cannot be empty');
    }

    return createHmac('sha256', secret)
      .update(normalizedAnswer, 'utf8')
      .digest();
  }

  private compareAnswer(
    answer: string,
    storedHash: string,
  ): boolean {
    const inputHash = this.hashAnswer(answer);

    const expectedHash = Buffer.from(storedHash, 'hex');

    if (
      inputHash.length !== expectedHash.length ||
      expectedHash.length === 0
    ) {
      return false;
    }

    return timingSafeEqual(inputHash, expectedHash);
  }

  private async refreshLostItemStatus(
    manager: EntityManager,
    lostItemId: string,
  ): Promise<void> {
    const lostItemRepository = manager.getRepository(LostItem);
    const claimRepository = manager.getRepository(OwnershipClaim);
    const matchRepository = manager.getRepository(ItemMatch);

    const lostItem = await lostItemRepository.findOne({
      where: { id: lostItemId },
    });

    if (!lostItem) {
      throw new NotFoundException('Lost item not found');
    }

    if (
      lostItem.status === LostItemStatus.RESOLVED ||
      lostItem.status === LostItemStatus.CLOSED
    ) {
      return;
    }

    const activeStatuses = [
      ClaimStatus.SUBMITTED,
      ClaimStatus.VERIFICATION_PENDING,
      ClaimStatus.UNDER_REVIEW,
      ClaimStatus.APPROVED,
    ];

    const activeClaims = await claimRepository
      .createQueryBuilder('claim')
      .innerJoin(
        ItemMatch,
        'match',
        'match.id = claim.matchId',
      )
      .where('match.lostItemId = :lostItemId', { lostItemId })
      .andWhere('claim.claimStatus IN (:...statuses)', {
        statuses: activeStatuses,
      })
      .getCount();

    if (activeClaims > 0) {
      lostItem.status = LostItemStatus.CLAIM_PENDING;
    } else {
      const availableMatches = await matchRepository.count({
        where: {
          lostItemId,
          status: In([
            MatchStatus.SUGGESTED,
            MatchStatus.VIEWED,
          ]),
        },
      });

      lostItem.status =
        availableMatches > 0
          ? LostItemStatus.MATCHED
          : LostItemStatus.OPEN;
    }

    await lostItemRepository.save(lostItem);
  }

  async create(
    createDto: CreateClaimDto,
    passengerId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const matchRepository = manager.getRepository(ItemMatch);
      const lostItemRepository = manager.getRepository(LostItem);
      const claimRepository = manager.getRepository(OwnershipClaim);

      const matchPreview = await matchRepository.findOne({
        where: { id: createDto.matchId },
      });

      if (!matchPreview) {
        throw new NotFoundException('Item match not found');
      }

      const lostItem = await lostItemRepository
        .createQueryBuilder('lostItem')
        .setLock('pessimistic_write')
        .where('lostItem.id = :id', {
          id: matchPreview.lostItemId,
        })
        .getOne();

      if (!lostItem) {
        throw new NotFoundException('Lost item not found');
      }

      const match = await matchRepository
        .createQueryBuilder('match')
        .setLock('pessimistic_write')
        .where('match.id = :id', {
          id: createDto.matchId,
        })
        .getOne();

      if (!match) {
        throw new NotFoundException('Item match not found');
      }

      if (lostItem.passengerId !== passengerId) {
        throw new ForbiddenException(
          'You are not allowed to claim this match',
        );
      }

      if (
        match.status === MatchStatus.DISMISSED ||
        lostItem.status === LostItemStatus.RESOLVED ||
        lostItem.status === LostItemStatus.CLOSED
      ) {
        throw new BadRequestException(
          'Cannot create a claim for this match',
        );
      }

      const existingClaim = await claimRepository.findOne({
        where: {
          matchId: match.id,
          passengerId,
        },
      });

      if (existingClaim) {
        throw new ConflictException(
          'An ownership claim already exists for this match',
        );
      }

      const claim = claimRepository.create({
        matchId: match.id,
        passengerId,
        claimStatus: ClaimStatus.VERIFICATION_PENDING,
        verificationStatus: VerificationStatus.PENDING,
        claimNote: createDto.claimNote ?? null,
        submittedAt: new Date(),
      });

      const savedClaim = await claimRepository.save(claim);

      match.status = MatchStatus.CLAIMED;
      await matchRepository.save(match);

      lostItem.status = LostItemStatus.CLAIM_PENDING;
      await lostItemRepository.save(lostItem);

      return savedClaim;
    });
  }

  async findAll(user: AuthenticatedUser) {
    const where =
      user.role === UserRole.PASSENGER
        ? { passengerId: user.id }
        : {};

    return this.claimRepository.find({
      where,
      relations: {
        match: {
          lostItem: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, user: AuthenticatedUser) {
    const claim = await this.claimRepository.findOne({
      where: { id },
      relations: {
        match: {
          lostItem: true,
        },
      },
    });

    if (!claim) {
      throw new NotFoundException('Ownership claim not found');
    }

    if (
      user.role === UserRole.PASSENGER &&
      claim.passengerId !== user.id
    ) {
      throw new ForbiddenException(
        'You are not allowed to access this claim',
      );
    }

    if (user.role === UserRole.ADMIN) {
      const verifications = await this.verificationRepository.find({
        where: { claimId: claim.id },
        order: { answeredAt: 'ASC' },
      });

      return {
        ...claim,
        verifications,
      };
    }

    return claim;
  }

  async verifyClaim(
    claimId: string,
    verifyDto: VerifyClaimDto,
    passengerId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const claimRepository = manager.getRepository(OwnershipClaim);
      const matchRepository = manager.getRepository(ItemMatch);
      const lostItemRepository = manager.getRepository(LostItem);
      const verificationRepository =
        manager.getRepository(ClaimVerification);
      const attributeRepository = manager.getRepository(
        FoundItemPrivateAttribute,
      );

      const claimPreview = await claimRepository.findOne({
        where: { id: claimId },
      });

      if (!claimPreview) {
        throw new NotFoundException('Ownership claim not found');
      }

      if (claimPreview.passengerId !== passengerId) {
        throw new ForbiddenException(
          'You are not allowed to verify this claim',
        );
      }

      const matchPreview = await matchRepository.findOne({
        where: { id: claimPreview.matchId },
      });

      if (!matchPreview) {
        throw new NotFoundException('Item match not found');
      }

      const lostItem = await lostItemRepository
        .createQueryBuilder('lostItem')
        .setLock('pessimistic_write')
        .where('lostItem.id = :id', {
          id: matchPreview.lostItemId,
        })
        .getOne();

      if (!lostItem) {
        throw new NotFoundException('Lost item not found');
      }

      const claim = await claimRepository
        .createQueryBuilder('claim')
        .setLock('pessimistic_write')
        .where('claim.id = :id', { id: claimId })
        .getOne();

      if (!claim) {
        throw new NotFoundException('Ownership claim not found');
      }

      if (claim.passengerId !== passengerId) {
        throw new ForbiddenException(
          'You are not allowed to verify this claim',
        );
      }

      if (
        claim.claimStatus === ClaimStatus.REJECTED ||
        claim.claimStatus === ClaimStatus.CANCELLED ||
        claim.claimStatus === ClaimStatus.APPROVED ||
        claim.claimStatus === ClaimStatus.COMPLETED
      ) {
        throw new BadRequestException(
          `Cannot verify claim in ${claim.claimStatus} status`,
        );
      }

      if (
        claim.verificationStatus === VerificationStatus.PASSED ||
        claim.verificationStatus === VerificationStatus.MANUAL_REVIEW
      ) {
        throw new BadRequestException(
          'Claim verification has already finished',
        );
      }

      const answers = verifyDto.answers;

      if (!answers || answers.length !== 2) {
        throw new BadRequestException(
          'Exactly two answers are required',
        );
      }

      const attributeIds = answers.map(
        (answer) => answer.privateAttributeId,
      );

      if (new Set(attributeIds).size !== 2) {
        throw new BadRequestException(
          'Two different private attributes are required',
        );
      }

      const attributes = await attributeRepository
        .createQueryBuilder('attribute')
        .addSelect('attribute.answerHash')
        .where('attribute.foundItemId = :foundItemId', {
          foundItemId: matchPreview.foundItemId,
        })
        .andWhere('attribute.id IN (:...ids)', {
          ids: attributeIds,
        })
        .getMany();

      if (attributes.length !== 2) {
        throw new BadRequestException(
          'Invalid private attribute selection',
        );
      }

      const previousVerifications =
        await verificationRepository.find({
          where: { claimId },
          order: { attemptNumber: 'DESC' },
        });

      const previousAttempts = previousVerifications.reduce(
        (max, item) => Math.max(max, item.attemptNumber),
        0,
      );

      if (previousAttempts >= 3) {
        throw new BadRequestException(
          'Maximum verification attempts reached',
        );
      }

      const attemptNumber = previousAttempts + 1;

      let allCorrect = true;

      for (const answer of answers) {
        const attribute = attributes.find(
          (item) => item.id === answer.privateAttributeId,
        );

        if (!attribute || !attribute.answerHash) {
          throw new BadRequestException(
            'Invalid private attribute',
          );
        }

        const isCorrect = this.compareAnswer(
          answer.answer,
          attribute.answerHash,
        );

        if (!isCorrect) {
          allCorrect = false;
        }

        verificationRepository.create({
          claimId,
          privateAttributeId: answer.privateAttributeId,
          isCorrect,
          attemptNumber,
        });

        await verificationRepository.save({
          claimId,
          privateAttributeId: answer.privateAttributeId,
          isCorrect,
          attemptNumber,
        });
      }

      if (allCorrect) {
        claim.verificationStatus = VerificationStatus.PASSED;
        claim.claimStatus = ClaimStatus.UNDER_REVIEW;
      } else if (attemptNumber >= 3) {
        claim.verificationStatus = VerificationStatus.MANUAL_REVIEW;
        claim.claimStatus = ClaimStatus.UNDER_REVIEW;
      } else {
        claim.verificationStatus = VerificationStatus.PENDING;
        claim.claimStatus = ClaimStatus.VERIFICATION_PENDING;
      }

      await claimRepository.save(claim);

      return {
        message: allCorrect
          ? 'Verification passed and claim moved to review'
          : attemptNumber >= 3
            ? 'Maximum attempts reached. Claim moved to manual review'
            : 'Verification failed. You may try again',
        attemptNumber,
        attemptsRemaining: Math.max(0, 3 - attemptNumber),
        claimStatus: claim.claimStatus,
        verificationStatus: claim.verificationStatus,
      };
    });
  }

  async reviewClaim(
    claimId: string,
    reviewDto: ReviewClaimDto,
    adminId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const claimRepository = manager.getRepository(OwnershipClaim);
      const matchRepository = manager.getRepository(ItemMatch);
      const lostItemRepository = manager.getRepository(LostItem);

      const claimPreview = await claimRepository.findOne({
        where: { id: claimId },
      });

      if (!claimPreview) {
        throw new NotFoundException('Ownership claim not found');
      }

      const matchPreview = await matchRepository.findOne({
        where: { id: claimPreview.matchId },
      });

      if (!matchPreview) {
        throw new NotFoundException('Item match not found');
      }

      const lostItem = await lostItemRepository
        .createQueryBuilder('lostItem')
        .setLock('pessimistic_write')
        .where('lostItem.id = :id', {
          id: matchPreview.lostItemId,
        })
        .getOne();

      if (!lostItem) {
        throw new NotFoundException('Lost item not found');
      }

      const claim = await claimRepository
        .createQueryBuilder('claim')
        .setLock('pessimistic_write')
        .where('claim.id = :claimId', { claimId })
        .getOne();

      if (!claim) {
        throw new NotFoundException('Ownership claim not found');
      }

      if (claim.matchId !== matchPreview.id) {
        throw new ConflictException(
          'Claim match information changed during review',
        );
      }

      if (claim.claimStatus !== ClaimStatus.UNDER_REVIEW) {
        throw new BadRequestException(
          'Only claims under review can be approved or rejected',
        );
      }

      if (
        reviewDto.claimStatus !== ClaimStatus.APPROVED &&
        reviewDto.claimStatus !== ClaimStatus.REJECTED
      ) {
        throw new BadRequestException(
          'Admin can only approve or reject a claim',
        );
      }

      if (
        claim.verificationStatus !== VerificationStatus.PASSED &&
        claim.verificationStatus !== VerificationStatus.MANUAL_REVIEW
      ) {
        throw new BadRequestException(
          'Claim is not eligible for admin review',
        );
      }

      const activeStatuses = [
        ClaimStatus.SUBMITTED,
        ClaimStatus.VERIFICATION_PENDING,
        ClaimStatus.UNDER_REVIEW,
        ClaimStatus.APPROVED,
      ];

      if (reviewDto.claimStatus === ClaimStatus.APPROVED) {
        if (
          lostItem.status === LostItemStatus.RESOLVED ||
          lostItem.status === LostItemStatus.CLOSED
        ) {
          throw new ConflictException(
            'This lost item is already resolved or closed',
          );
        }

        const existingApprovedClaim = await claimRepository
          .createQueryBuilder('otherClaim')
          .innerJoin(
            ItemMatch,
            'otherMatch',
            'otherMatch.id = otherClaim.matchId',
          )
          .where('otherMatch.lostItemId = :lostItemId', {
            lostItemId: lostItem.id,
          })
          .andWhere('otherClaim.id != :claimId', { claimId })
          .andWhere('otherClaim.claimStatus IN (:...statuses)', {
            statuses: [
              ClaimStatus.APPROVED,
              ClaimStatus.COMPLETED,
            ],
          })
          .getOne();

        if (existingApprovedClaim) {
          throw new ConflictException(
            'Another claim for this lost item has already been approved',
          );
        }
      }

      claim.claimStatus = reviewDto.claimStatus;
      claim.reviewedByAdminId = adminId;
      claim.reviewedAt = new Date();
      claim.reviewNote = reviewDto.reviewNote ?? null;

      const updatedClaim = await claimRepository.save(claim);
if (reviewDto.claimStatus === ClaimStatus.APPROVED) {
  // Keep the lost item in CLAIM_PENDING.
  // It will become RESOLVED only after successful handover.

  await matchRepository
    .createQueryBuilder()
    .update(ItemMatch)
    .set({ status: MatchStatus.DISMISSED })
    .where('lostItemId = :lostItemId', {
      lostItemId: lostItem.id,
    })
    .andWhere('id != :matchId', {
      matchId: matchPreview.id,
    })
    .andWhere('status IN (:...statuses)', {
      statuses: [
        MatchStatus.SUGGESTED,
        MatchStatus.VIEWED,
      ],
    })
    .execute();
} else {
        const otherActiveClaimsForMatch = await claimRepository.count({
          where: {
            matchId: matchPreview.id,
            claimStatus: In(activeStatuses),
          },
        });

        if (otherActiveClaimsForMatch === 0) {
          const match = await matchRepository.findOne({
            where: { id: matchPreview.id },
          });

          if (match && match.status === MatchStatus.CLAIMED) {
            match.status = MatchStatus.VIEWED;
            await matchRepository.save(match);
          }
        }

        await this.refreshLostItemStatus(manager, lostItem.id);
      }

      return updatedClaim;
    });
  }

  async cancelClaim(
    claimId: string,
    passengerId: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const claimRepository = manager.getRepository(OwnershipClaim);
      const matchRepository = manager.getRepository(ItemMatch);
      const lostItemRepository = manager.getRepository(LostItem);

      const claimPreview = await claimRepository.findOne({
        where: { id: claimId },
      });

      if (!claimPreview) {
        throw new NotFoundException('Ownership claim not found');
      }

      if (claimPreview.passengerId !== passengerId) {
        throw new ForbiddenException(
          'You are not allowed to cancel this claim',
        );
      }

      const matchPreview = await matchRepository.findOne({
        where: { id: claimPreview.matchId },
      });

      if (!matchPreview) {
        throw new NotFoundException('Item match not found');
      }

      const lostItem = await lostItemRepository
        .createQueryBuilder('lostItem')
        .setLock('pessimistic_write')
        .where('lostItem.id = :id', {
          id: matchPreview.lostItemId,
        })
        .getOne();

      if (!lostItem) {
        throw new NotFoundException('Lost item not found');
      }

      const claim = await claimRepository
        .createQueryBuilder('claim')
        .setLock('pessimistic_write')
        .where('claim.id = :claimId', { claimId })
        .getOne();

      if (!claim) {
        throw new NotFoundException('Ownership claim not found');
      }

      if (
        claim.passengerId !== passengerId ||
        claim.matchId !== matchPreview.id
      ) {
        throw new ForbiddenException(
          'You are not allowed to cancel this claim',
        );
      }

      if (
        claim.claimStatus === ClaimStatus.CANCELLED ||
        claim.claimStatus === ClaimStatus.REJECTED ||
        claim.claimStatus === ClaimStatus.APPROVED ||
        claim.claimStatus === ClaimStatus.COMPLETED
      ) {
        throw new BadRequestException(
          `Cannot cancel claim in ${claim.claimStatus} status`,
        );
      }

      claim.claimStatus = ClaimStatus.CANCELLED;

      const updatedClaim = await claimRepository.save(claim);

      const activeStatuses = [
        ClaimStatus.SUBMITTED,
        ClaimStatus.VERIFICATION_PENDING,
        ClaimStatus.UNDER_REVIEW,
        ClaimStatus.APPROVED,
      ];

      const otherActiveClaimsForMatch = await claimRepository.count({
        where: {
          matchId: matchPreview.id,
          claimStatus: In(activeStatuses),
        },
      });

      if (otherActiveClaimsForMatch === 0) {
        const match = await matchRepository.findOne({
          where: { id: matchPreview.id },
        });

        if (match && match.status === MatchStatus.CLAIMED) {
          match.status = MatchStatus.VIEWED;
          await matchRepository.save(match);
        }
      }

      await this.refreshLostItemStatus(manager, lostItem.id);

      return updatedClaim;
    });
  }
}
