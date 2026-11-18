import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  QueryFailedError,
} from 'typeorm';

import { Station } from './entities/station.entity.js';
import { CreateStationDto } from './dto/create-station.dto.js';
import { UpdateStationDto } from './dto/update-station.dto.js';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
  ) {}

  async create(createStationDto: CreateStationDto) {
    const existingStation = await this.stationRepository.findOne({
      where: {
        stationCode: createStationDto.stationCode,
      },
    });

    if (existingStation) {
      throw new ConflictException(
        'Station code already exists',
      );
    }

    const station = this.stationRepository.create(
      createStationDto,
    );

    try {
      return await this.stationRepository.save(station);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Station code already exists',
        );
      }

      throw error;
    }
  }

  async findAll() {
    return this.stationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const station = await this.stationRepository.findOne({
      where: { id },
    });

    if (!station) {
      throw new NotFoundException('Station not found');
    }

    return station;
  }

  async update(
    id: string,
    updateStationDto: UpdateStationDto,
  ) {
    const station = await this.findOne(id);

    if (updateStationDto.stationCode) {
      const existingStation = await this.stationRepository.findOne({
        where: {
          stationCode: updateStationDto.stationCode,
        },
      });

      if (existingStation && existingStation.id !== id) {
        throw new ConflictException(
          'Station code already exists',
        );
      }
    }

    Object.assign(station, updateStationDto);

    try {
      return await this.stationRepository.save(station);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Station code already exists',
        );
      }

      throw error;
    }
  }

  async deactivate(id: string) {
    const station = await this.findOne(id);

    station.isActive = false;

    await this.stationRepository.save(station);

    return {
      message: 'Station deactivated successfully',
    };
  }
}