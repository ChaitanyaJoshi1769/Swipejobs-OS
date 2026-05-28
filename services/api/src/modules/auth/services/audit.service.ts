import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditLogData {
  organizationId: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  status?: 'success' | 'failure';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogsRepository.create({
      id: uuidv4(),
      organization_id: data.organizationId,
      user_id: data.userId,
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      old_values: data.oldValues ? JSON.stringify(data.oldValues) : null,
      new_values: data.newValues ? JSON.stringify(data.newValues) : null,
      status: data.status || 'success',
      error_message: data.errorMessage,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    });

    return this.auditLogsRepository.save(auditLog);
  }

  async getLogs(
    organizationId: string,
    filters?: {
      userId?: string;
      resourceType?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<[AuditLog[], number]> {
    let query = this.auditLogsRepository
      .createQueryBuilder('audit')
      .where('audit.organization_id = :organizationId', { organizationId });

    if (filters?.userId) {
      query = query.andWhere('audit.user_id = :userId', {
        userId: filters.userId,
      });
    }

    if (filters?.resourceType) {
      query = query.andWhere('audit.resource_type = :resourceType', {
        resourceType: filters.resourceType,
      });
    }

    if (filters?.action) {
      query = query.andWhere('audit.action = :action', {
        action: filters.action,
      });
    }

    if (filters?.startDate) {
      query = query.andWhere('audit.created_at >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('audit.created_at <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query = query
      .orderBy('audit.created_at', 'DESC')
      .skip(filters?.offset || 0)
      .take(filters?.limit || 50);

    return query.getManyAndCount();
  }

  async getLogsByResource(
    organizationId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: {
        organization_id: organizationId,
        resource_type: resourceType,
        resource_id: resourceId,
      },
      order: { created_at: 'DESC' },
    });
  }
}
