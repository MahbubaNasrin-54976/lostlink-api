import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  QueryFailedError,
} from 'typeorm';

import { Vehicle } from './entities/vehicle.entity.js';
import { TransportRoute } from '../routes/entities/transport-route.entity.js';

import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from './dto/update-vehicle.dto.js';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,

    @InjectRepository(TransportRoute)
    private readonly routeRepository: Repository<TransportRoute>,
  ) {}

  private async validateRoute(routeId: string) {
    const route = await this.routeRepository.findOne({
      where: {
        id: routeId,
        isActive: true,
      },
    });

    if (!route) {
      throw new BadRequestException(
        'Route does not exist or is inactive',
      );
    }

    return route;
  }

  async create(createVehicleDto: CreateVehicleDto) {
    const existingVehicle = await this.vehicleRepository.findOne({
      where: {
        vehicleNumber: createVehicleDto.vehicleNumber,
      },
    });

    if (existingVehicle) {
      throw new ConflictException(
        'Vehicle number already exists',
      );
    }

    const route = await this.validateRoute(
      createVehicleDto.routeId,
    );

    const vehicle = this.vehicleRepository.create({
      vehicleNumber: createVehicleDto.vehicleNumber,
      vehicleType: createVehicleDto.vehicleType,
      route,
      isActive: true,
    });

    try {
      return await this.vehicleRepository.save(vehicle);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Vehicle number already exists',
        );
      }

      throw error;
    }
  }

  async findAll() {
    return this.vehicleRepository.find({
      relations: {
        route: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: {
        route: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ) {
    const vehicle = await this.findOne(id);

    const { routeId, ...otherData } = updateVehicleDto;

    if (routeId) {
      vehicle.route = await this.validateRoute(routeId);
    }

    Object.assign(vehicle, otherData);

    try {
      return await this.vehicleRepository.save(vehicle);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Vehicle number already exists',
        );
      }

      throw error;
    }
  }

  async deactivate(id: string) {
    const vehicle = await this.findOne(id);

    vehicle.isActive = false;

    await this.vehicleRepository.save(vehicle);

    return {
      message: 'Vehicle deactivated successfully',
    };
  }
}