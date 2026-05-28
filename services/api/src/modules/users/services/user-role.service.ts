import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
  ) {}

  async assignRole(
    userId: string,
    roleId: string,
    organizationId: string,
  ): Promise<UserRole> {
    // Check if already assigned
    const existing = await this.userRolesRepository.findOne({
      where: { user_id: userId, role_id: roleId, organization_id: organizationId },
    });

    if (existing) {
      return existing;
    }

    const userRole = this.userRolesRepository.create({
      id: uuidv4(),
      user_id: userId,
      role_id: roleId,
      organization_id: organizationId,
    });

    return this.userRolesRepository.save(userRole);
  }

  async removeRole(
    userId: string,
    roleId: string,
    organizationId: string,
  ): Promise<void> {
    const result = await this.userRolesRepository.delete({
      user_id: userId,
      role_id: roleId,
      organization_id: organizationId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('User role not found');
    }
  }

  async getUserRoles(userId: string, organizationId: string): Promise<UserRole[]> {
    return this.userRolesRepository.find({
      where: { user_id: userId, organization_id: organizationId },
    });
  }

  async getOrganizationUsers(organizationId: string): Promise<UserRole[]> {
    return this.userRolesRepository.find({
      where: { organization_id: organizationId },
    });
  }
}
