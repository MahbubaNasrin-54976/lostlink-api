
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

import { FoundItemEntity } from './entities/found-item.entity.js';
import { FoundItemPrivateAttribute } from './entities/found-item-private-attribute.entity.js';

import { CreateFoundItemDto } from './dto/create-found-item.dto.js';
import { UpdateFoundItemDto } from './dto/update-found-item.dto.js';

@Injectable()
export class FoundItemsService {
  constructor(
    @InjectRepository(FoundItemEntity)
    private readonly foundItemRepository: Repository<FoundItemEntity>,

    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,
  ) {}

  private hashAnswer(answer: string): string {
    const secret = this.configService.getOrThrow<string>(
      'PRIVATE_ATTRIBUTE_SECRET',
    );

    const normalizedAnswer = answer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

    if (!normalizedAnswer) {
      throw new BadRequestException(
        'Private question answer cannot be empty',
      );
    }

    return createHmac('sha256', secret)
      .update(normalizedAnswer, 'utf8')
      .digest('hex');
  }

  async create(
    createDto: CreateFoundItemDto,
    staffId: string,
  ): Promise<FoundItemEntity> {
    const { privateAttributes, evidence, ...itemData } = createDto;

    if (
      !privateAttributes ||
      privateAttributes.length !== 2 ||
      privateAttributes[0].questionNumber ===
        privateAttributes[1].questionNumber ||
      !privateAttributes.some((item) => item.questionNumber === 1) ||
      !privateAttributes.some((item) => item.questionNumber === 2)
    ) {
      throw new BadRequestException(
        'Exactly two private questions are required with question numbers 1 and 2',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const itemRepository = manager.getRepository(FoundItemEntity);
      const attributeRepository = manager.getRepository(
        FoundItemPrivateAttribute,
      );

      const newItem = itemRepository.create({
        ...itemData,
        foundAt: new Date(createDto.foundAt),
        registeredByStaffId: staffId,
        evidence: evidence ?? [],
      });

      const savedItem = await itemRepository.save(newItem);

      const attributes = privateAttributes.map((attribute) =>
        attributeRepository.create({
          foundItemId: savedItem.id,
          questionNumber: attribute.questionNumber,
          question: attribute.question.trim(),
          answerHash: this.hashAnswer(attribute.answer),
        }),
      );

      await attributeRepository.save(attributes);

      return savedItem;
    });
  }

  async findAll(): Promise<FoundItemEntity[]> {
    return await this.foundItemRepository.find({
      relations: { evidence: true },
    });
  }

  async findOne(id: string): Promise<FoundItemEntity> {
    const item = await this.foundItemRepository.findOne({
      where: { id },
      relations: { evidence: true },
    });

    if (!item) {
      throw new NotFoundException(
        `Found item with ID ${id} not found`,
      );
    }

    return item;
  }

  async update(
    id: string,
    updateDto: UpdateFoundItemDto,
  ): Promise<FoundItemEntity> {
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
