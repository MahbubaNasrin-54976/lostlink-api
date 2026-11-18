import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoundItemEntity } from './entities/found-item.entity.js';
import { CreateFoundItemDto } from './dto/create-found-item.dto.js';
import { UpdateFoundItemDto } from './dto/update-found-item.dto.js';

@Injectable()
export class FoundItemsService {
  constructor(
    @InjectRepository(FoundItemEntity)
    private readonly foundItemRepository: Repository<FoundItemEntity>,
  ) {}

  async create(createDto: CreateFoundItemDto, staffId: string): Promise<FoundItemEntity> {
    const newItem = this.foundItemRepository.create({
      ...createDto,
      foundAt: new Date(createDto.foundAt),
      registeredByStaffId: staffId,
    });
    return await this.foundItemRepository.save(newItem);
  }

  async findAll(): Promise<FoundItemEntity[]> {
    return await this.foundItemRepository.find({ relations: { evidence: true } });
  }

  async findOne(id: string): Promise<FoundItemEntity> {
    const item = await this.foundItemRepository.findOne({
      where: { id },
      relations: { evidence: true },
    });
    if (!item) {
      throw new NotFoundException(`Found item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateFoundItemDto): Promise<FoundItemEntity> {
    const item = await this.findOne(id);
    
    if (updateDto.foundAt) {
      updateDto.foundAt = new Date(updateDto.foundAt) as any;
    }

    Object.assign(item, updateDto);
    return await this.foundItemRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.foundItemRepository.remove(item);
  }
}