
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../users/entities/user.entity.js';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({
      where: {
        id: payload.sub,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User is inactive or does not exist');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
