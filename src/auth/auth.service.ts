
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity.js';
import { UserRole } from '../common/enums/user-role.enum.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  // Passenger Registration
  async register(registerDto: RegisterDto) {
    const {
  fullName,
  phone,
  password,
} = registerDto;

const email = registerDto.email.trim().toLowerCase();
const normalizedPhone = phone.trim();

    const existingUser = await this.userRepository.findOne({
  where: [
    { email },
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
      fullName,
      email,
      phone,
      passwordHash,
      role: UserRole.PASSENGER,
      isActive: true,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      return {
        message: 'Registration successful',
        user: {
          id: savedUser.id,
          fullName: savedUser.fullName,
          email: savedUser.email,
          phone: savedUser.phone,
          role: savedUser.role,
          isActive: savedUser.isActive,
          createdAt: savedUser.createdAt,
        },
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

  // Login
  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    const { password } = loginDto;

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account is inactive');
    }

    const passwordMatched = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
