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

import { TransportRoute } from './entities/transport-route.entity.js';
import { CreateRouteDto } from './dto/create-route.dto.js';
import { UpdateRouteDto } from './dto/update-route.dto.js';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(TransportRoute)
    private readonly routeRepository: Repository<TransportRoute>,
  ) {}

  async create(createRouteDto: CreateRouteDto) {
    const existingRoute = await this.routeRepository.findOne({
      where: {
        routeCode: createRouteDto.routeCode,
      },
    });

    if (existingRoute) {
      throw new ConflictException('Route code already exists');
    }

    const route = this.routeRepository.create(createRouteDto);

    try {
      return await this.routeRepository.save(route);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException('Route code already exists');
      }

      throw error;
    }
  }

  async findAll() {
    return this.routeRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const route = await this.routeRepository.findOne({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async update(
    id: string,
    updateRouteDto: UpdateRouteDto,
  ) {
    const route = await this.findOne(id);

    if (updateRouteDto.routeCode) {
      const existingRoute = await this.routeRepository.findOne({
        where: {
          routeCode: updateRouteDto.routeCode,
        },
      });

      if (existingRoute && existingRoute.id !== id) {
        throw new ConflictException('Route code already exists');
      }
    }

    Object.assign(route, updateRouteDto);

    try {
      return await this.routeRepository.save(route);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException('Route code already exists');
      }

      throw error;
    }
  }

  async deactivate(id: string) {
    const route = await this.findOne(id);

    route.isActive = false;

    await this.routeRepository.save(route);

    return {
      message: 'Route deactivated successfully',
    };
  }
}