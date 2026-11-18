import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FoundItemsService } from './found-items.service.js';
import { CreateFoundItemDto } from './dto/create-found-item.dto.js';
import { UpdateFoundItemDto } from './dto/update-found-item.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface.js';

@Controller('found-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STAFF, UserRole.ADMIN)
export class FoundItemsController {
  constructor(private readonly foundItemsService: FoundItemsService) {}

  @Post()
  create(@Body() createFoundItemDto: CreateFoundItemDto, @Req() req: { user: AuthenticatedUser }) {
    return this.foundItemsService.create(createFoundItemDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.foundItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foundItemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFoundItemDto: UpdateFoundItemDto,
  ) {
    return this.foundItemsService.update(id, updateFoundItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foundItemsService.remove(id);
  }
}