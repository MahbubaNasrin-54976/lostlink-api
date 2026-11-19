
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

import { UserRole } from '../common/enums/user-role.enum.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Admin creates Staff account
  async create(createUserDto: CreateUserDto) {
    const { email, phone, password, ...otherData } = createUserDto;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const existingUser = await this.userRepository.findOne({
      where: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'Email or phone number already exists',
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      ...otherData,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      role: UserRole.STAFF,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      return {
        id: savedUser.id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        isActive: savedUser.isActive,
        createdAt: savedUser.createdAt,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Email or phone number already exists',
        );
      }

      throw error;
    }
  }

  // Admin: Get all users
  async findAll() {
    return this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Admin and Staff: Get Passenger list only
  async findPassengers() {
    return this.userRepository.find({
      where: {
        role: UserRole.PASSENGER,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get single user
  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Update User
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.email) {
      updateUserDto.email =
        updateUserDto.email.trim().toLowerCase();
    }

    if (updateUserDto.phone) {
      updateUserDto.phone = updateUserDto.phone.trim();
    }

    Object.assign(user, updateUserDto);

    try {
      const updatedUser = await this.userRepository.save(user);

      return {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Email or phone number already exists',
        );
      }

      throw error;
    }
  }

  // Soft Delete User
  async remove(id: string) {
    const user = await this.findOne(id);

    await this.userRepository.softDelete(user.id);

    return {
      message: 'User deleted successfully',
    };
  }
}
