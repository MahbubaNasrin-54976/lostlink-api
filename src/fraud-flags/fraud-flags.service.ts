import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { FraudFlag } from './entities/fraud-flag.entity.js';
import { ReviewFraudFlagDto } from './dto/review-fraud-flag.dto.js';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface.js';

@Injectable()
export class FraudFlagsService {
  constructor(
  @InjectRepository(FraudFlag)
  private readonly fraudFlagRepository: Repository<FraudFlag>,

  private readonly auditLogsService: AuditLogsService,
) {}

  async findAll() {
    return this.fraudFlagRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const fraudFlag = await this.fraudFlagRepository.findOne({
      where: { id },
    });

    if (!fraudFlag) {
      throw new NotFoundException('Fraud flag not found');
    }

    return fraudFlag;
  }

 async review(
  id: string,
  reviewDto: ReviewFraudFlagDto,
  admin: AuthenticatedUser,) {
  const fraudFlag = await this.findOne(id);

  const oldValue = {
    status: fraudFlag.status,
    reviewedAt: fraudFlag.reviewedAt,
  };

  fraudFlag.status = reviewDto.status;
  fraudFlag.reviewedByAdmin = {
    id: admin.id,
  } as User;
  fraudFlag.reviewedAt = new Date();

  const updatedFlag = await this.fraudFlagRepository.save(fraudFlag);

  await this.auditLogsService.create({
    actorUserId: admin.id,
    action: 'REVIEW_FRAUD_FLAG',
    entityName: 'fraud_flags',
    entityId: updatedFlag.id,
    oldValue,
    newValue: {
      status: updatedFlag.status,
      reviewedAt: updatedFlag.reviewedAt,
    },
  });

  return updatedFlag;
}
}