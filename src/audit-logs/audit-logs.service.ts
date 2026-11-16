import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLog } from './entities/audit-log.entity.js';
import { User } from '../users/entities/user.entity.js';

interface CreateAuditLogData {
  actorUserId: string | null;
  action: string;
  entityName: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(data: CreateAuditLogData) {
    const auditLog = this.auditLogRepository.create({
      actorUser: data.actorUserId
        ? ({ id: data.actorUserId } as User)
        : null,

      action: data.action,
      entityName: data.entityName,
      entityId: data.entityId,

      oldValue: data.oldValue ?? null,
      newValue: data.newValue ?? null,

      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async findAll() {
    return this.auditLogRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 100,
    });
  }

  async findOne(id: string) {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: {
        actorUser: true,
      },
    });

    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }

    return auditLog;
  }
}