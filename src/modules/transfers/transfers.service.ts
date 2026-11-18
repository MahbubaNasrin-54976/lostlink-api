import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemTransferEntity } from './entities/item-transfer.entity.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { UpdateTransferStatusDto } from './dto/update-transfer-status.dto.js';
import { TransferStatus } from '../../common/enums/transfer-status.enum.js';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(ItemTransferEntity)
    private readonly transferRepository: Repository<ItemTransferEntity>,
  ) {}

  async create(createDto: CreateTransferDto, staffId: string): Promise<ItemTransferEntity> {
    const transfer = this.transferRepository.create({
      ...createDto,
      initiatedByStaffId: staffId,
      status: TransferStatus.PENDING,
    });
    return await this.transferRepository.save(transfer);
  }

  async findAll(): Promise<ItemTransferEntity[]> {
    return await this.transferRepository.find();
  }

  async findOne(id: string): Promise<ItemTransferEntity> {
    const transfer = await this.transferRepository.findOne({ where: { id } });
    if (!transfer) {
      throw new NotFoundException(`Transfer record with ID ${id} not found`);
    }
    return transfer;
  }

  async updateStatus(
    id: string,
    updateDto: UpdateTransferStatusDto,
    staffId: string,
  ): Promise<ItemTransferEntity> {
    const transfer = await this.findOne(id);
    transfer.status = updateDto.status;
    
    if (updateDto.status === TransferStatus.ACCEPTED || updateDto.status === TransferStatus.REJECTED) {
      transfer.receivedByStaffId = staffId;
    }

    return await this.transferRepository.save(transfer);
  }
}