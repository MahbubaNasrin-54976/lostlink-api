import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { HandoversService } from './handovers.service.js';
import { CreateHandoverDto } from './dto/create-handover.dto.js';
import { CompleteHandoverDto } from './dto/complete-handover.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';

@Controller('handovers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STAFF, UserRole.ADMIN)
export class HandoversController {
  constructor(private readonly handoversService: HandoversService) {}

  @Post()
  create(
    @Body() createHandoverDto: CreateHandoverDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.handoversService.create(createHandoverDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.handoversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.handoversService.findOne(id);
  }

  @Patch(':id/complete')
  complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteHandoverDto,
  ) {
    return this.handoversService.complete(id, completeDto);
  }
}