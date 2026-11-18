import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemHandoverEntity } from './entities/item-handover.entity.js';
import { CreateHandoverDto } from './dto/create-handover.dto.js';
import { CompleteHandoverDto } from './dto/complete-handover.dto.js';
import { HandoverStatus } from '../../common/enums/handover-status.enum.js';
import * as crypto from 'crypto';

@Injectable()
export class HandoversService {
  constructor(
    @InjectRepository(ItemHandoverEntity)
    private readonly handoverRepository: Repository<ItemHandoverEntity>,
  ) {}

  async create(createDto: CreateHandoverDto, staffId: string): Promise<ItemHandoverEntity> {
    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const handover = this.handoverRepository.create({
      ...createDto,
      verificationCode,
      processedByStaffId: staffId,
      status: HandoverStatus.PENDING,
    });
    return await this.handoverRepository.save(handover);
  }

  async findAll(): Promise<ItemHandoverEntity[]> {
    return await this.handoverRepository.find();
  }

  async findOne(id: string): Promise<ItemHandoverEntity> {
    const handover = await this.handoverRepository.findOne({ where: { id } });
    if (!handover) {
      throw new NotFoundException(`Handover record with ID ${id} not found`);
    }
    return handover;
  }

  async complete(id: string, completeDto: CompleteHandoverDto): Promise<ItemHandoverEntity> {
    const handover = await this.findOne(id);

    if (handover.status === HandoverStatus.COMPLETED) {
      throw new BadRequestException('This handover has already been completed.');
    }

    if (handover.verificationCode !== completeDto.verificationCode) {
      throw new BadRequestException('Invalid verification code provided.');
    }

    handover.status = HandoverStatus.COMPLETED;
    if (completeDto.signatureUrl) {
      handover.signatureUrl = completeDto.signatureUrl;
    }

    return await this.handoverRepository.save(handover);
  }
}