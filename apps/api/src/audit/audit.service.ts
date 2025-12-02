import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog, AuditAction } from './audit-log.entity';

export interface CreateAuditLogDto {
  userId?: number;
  userEmail?: string;
  action: AuditAction;
  entityType: string;
  entityId?: number;
  description?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilter {
  userId?: number;
  entityType?: string;
  entityId?: number;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  /**
   * Registra uma ação no log de auditoria
   */
  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditRepo.create({
      user_id: dto.userId ?? null,
      user_email: dto.userEmail ?? null,
      action: dto.action,
      entity_type: dto.entityType,
      entity_id: dto.entityId ?? null,
      description: dto.description ?? null,
      old_values: dto.oldValues ?? null,
      new_values: dto.newValues ?? null,
      ip_address: dto.ipAddress ?? null,
      user_agent: dto.userAgent ?? null,
    });

    return this.auditRepo.save(log);
  }

  /**
   * Busca logs de auditoria com filtros
   */
  async findAll(
    filter: AuditLogFilter = {},
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.userId) where.user_id = filter.userId;
    if (filter.entityType) where.entity_type = filter.entityType;
    if (filter.entityId) where.entity_id = filter.entityId;
    if (filter.action) where.action = filter.action;

    if (filter.startDate && filter.endDate) {
      where.created_at = Between(filter.startDate, filter.endDate);
    } else if (filter.startDate) {
      where.created_at = MoreThanOrEqual(filter.startDate);
    } else if (filter.endDate) {
      where.created_at = LessThanOrEqual(filter.endDate);
    }

    const [logs, total] = await this.auditRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      take: filter.limit ?? 50,
      skip: filter.offset ?? 0,
    });

    return { logs, total };
  }

  /**
   * Busca logs de um usuário específico
   */
  async findByUser(userId: number, limit = 50): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Busca logs de uma entidade específica
   */
  async findByEntity(
    entityType: string,
    entityId: number,
  ): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { created_at: 'DESC' },
    });
  }
}
