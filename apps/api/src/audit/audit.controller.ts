import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService, AuditLogFilter } from './audit.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditAction } from './audit-log.entity';

@Controller('audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('leader')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * RNF06 - Lista logs de auditoria com filtros
   */
  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filter: AuditLogFilter = {};

    if (userId) filter.userId = parseInt(userId, 10);
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = parseInt(entityId, 10);
    if (action) filter.action = action;
    if (startDate) filter.startDate = new Date(startDate);
    if (endDate) filter.endDate = new Date(endDate);
    if (limit) filter.limit = parseInt(limit, 10);
    if (offset) filter.offset = parseInt(offset, 10);

    return this.auditService.findAll(filter);
  }

  /**
   * Lista logs de um usuário específico
   */
  @Get('user')
  async findByUser(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByUser(userId, limit ? parseInt(limit, 10) : 50);
  }

  /**
   * Lista logs de uma entidade específica
   */
  @Get('entity')
  async findByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId', ParseIntPipe) entityId: number,
  ) {
    return this.auditService.findByEntity(entityType, entityId);
  }
}
