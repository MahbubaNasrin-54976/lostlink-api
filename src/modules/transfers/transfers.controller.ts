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
import { TransfersService } from './transfers.service.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';
import { UpdateTransferStatusDto } from './dto/update-transfer-status.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';

@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STAFF, UserRole.ADMIN)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  create(
    @Body() createTransferDto: CreateTransferDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.transfersService.create(createTransferDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.transfersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transfersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransferStatusDto,
    @Req() req: { user: AuthenticatedUser },
  ) {
    return this.transfersService.updateStatus(id, updateDto, req.user.id);
  }
}