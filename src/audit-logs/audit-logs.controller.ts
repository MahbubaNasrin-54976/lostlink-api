import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AuditLogsService } from './audit-logs.service.js';

import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';

@Controller('audit-logs')
@Roles(UserRole.ADMIN)
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.auditLogsService.findOne(id);
  }
}