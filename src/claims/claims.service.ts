import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnershipClaim } from './entities/ownership-claim.entity.js';
import { ClaimVerification } from './entities/claim-verification.entity.js';
import { ItemMatch } from '../matches/entities/item-match.entity.js';
import { LostItem } from '../lost-items/entities/lost-item.entity.js';
import { CreateClaimDto } from './dto/create-claim.dto.js';
import { VerifyClaimDto } from './dto/verify-claim.dto.js';
import { ReviewClaimDto } from './dto/review-claim.dto.js';
import {
  ClaimStatus,
  VerificationStatus,
} from '../common/enums/claim-status.enum.js';
import { MatchStatus } from '../common/enums/match-status.enum.js';
import { LostItemStatus } from '../common/enums/lost-item-status.enum.js';

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
  ) {}

  async create(createDto: CreateClaimDto) {
    const match = await this.matchRepository.findOne({
      where: { id: createDto.matchId },
      relations: { lostItem: true },
    });

    if (!match) {
      throw new NotFoundException('Item match not found');
    }

    const existingClaim = await this.claimRepository.findOne({
      where: {
        matchId: createDto.matchId,
        passengerId: createDto.passengerId,
      },
    });

    if (existingClaim) {
      throw new ConflictException(
        'An ownership claim already exists for this match',
      );
    }

    const claim = this.claimRepository.create({
      matchId: createDto.matchId,
      passengerId: createDto.passengerId,
      claimStatus: ClaimStatus.VERIFICATION_PENDING,
      verificationStatus: VerificationStatus.PENDING,
      claimNote: createDto.claimNote ?? null,
      submittedAt: new Date(),
    });

    const savedClaim = await this.claimRepository.save(claim);

    match.status = MatchStatus.CLAIMED;
    await this.matchRepository.save(match);

    if (match.lostItem) {
      match.lostItem.status = LostItemStatus.CLAIM_PENDING;
      await this.lostItemRepository.save(match.lostItem);
    }

    return savedClaim;
  }

  async findAll() {
    return this.claimRepository.find({
      relations: {
        match: {
          lostItem: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
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

    const verifications = await this.verificationRepository.find({
      where: { claimId: claim.id },
      order: { answeredAt: 'ASC' },
    });

    return {
      ...claim,
      verifications,
    };
  }

  async verifyClaim(claimId: string, verifyDto: VerifyClaimDto) {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException('Ownership claim not found');
    }

    if (
      claim.claimStatus === ClaimStatus.REJECTED ||
      claim.claimStatus === ClaimStatus.CANCELLED ||
      claim.claimStatus === ClaimStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `Cannot verify claim in ${claim.claimStatus} status`,
      );
    }

    const previousAttempts = await this.verificationRepository.count({
      where: { claimId },
    });

    const attemptNumber = verifyDto.attemptNumber ?? previousAttempts + 1;

    const verification = this.verificationRepository.create({
      claimId,
      privateAttributeId: verifyDto.privateAttributeId,
      isCorrect: verifyDto.isCorrect,
      attemptNumber,
    });

    const savedVerification =
      await this.verificationRepository.save(verification);

    if (verifyDto.isCorrect) {
      claim.verificationStatus = VerificationStatus.PASSED;
      claim.claimStatus = ClaimStatus.UNDER_REVIEW;
    } else {
      const failedCount = await this.verificationRepository.count({
        where: { claimId, isCorrect: false },
      });

      if (failedCount >= 3) {
        claim.verificationStatus = VerificationStatus.FAILED;
        claim.claimStatus = ClaimStatus.UNDER_REVIEW;
      } else {
        claim.verificationStatus = VerificationStatus.PENDING;
      }
    }

    await this.claimRepository.save(claim);

    return {
      message: verifyDto.isCorrect
        ? 'Verification passed and claim moved to review'
        : 'Verification attempt recorded',
      verification: savedVerification,
      claimStatus: claim.claimStatus,
      verificationStatus: claim.verificationStatus,
    };
  }

  async reviewClaim(claimId: string, reviewDto: ReviewClaimDto) {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
      relations: {
        match: {
          lostItem: true,
        },
      },
    });

    if (!claim) {
      throw new NotFoundException('Ownership claim not found');
    }

    claim.claimStatus = reviewDto.claimStatus;
    claim.reviewedByAdminId = reviewDto.reviewedByAdminId ?? null;
    claim.reviewedAt = new Date();
    claim.reviewNote = reviewDto.reviewNote ?? null;

    const updatedClaim = await this.claimRepository.save(claim);

    if (
      (reviewDto.claimStatus === ClaimStatus.APPROVED ||
        reviewDto.claimStatus === ClaimStatus.COMPLETED) &&
      claim.match?.lostItem
    ) {
      claim.match.lostItem.status = LostItemStatus.RESOLVED;
      await this.lostItemRepository.save(claim.match.lostItem);
    }

    return updatedClaim;
  }

  async cancelClaim(claimId: string) {
    const claim = await this.claimRepository.findOne({
      where: { id: claimId },
    });

    if (!claim) {
      throw new NotFoundException('Ownership claim not found');
    }

    claim.claimStatus = ClaimStatus.CANCELLED;
    return this.claimRepository.save(claim);
  }
}