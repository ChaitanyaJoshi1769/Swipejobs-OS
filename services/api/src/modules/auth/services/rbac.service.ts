import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { CreatePermissionDto } from '../dtos/create-permission.dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  // ============ Permissions ============

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const existing = await this.permissionsRepository.findOne({
      where: { name: createPermissionDto.name },
    });

    if (existing) {
      throw new BadRequestException('Permission already exists');
    }

    const permission = this.permissionsRepository.create({
      id: uuidv4(),
      ...createPermissionDto,
    });

    return this.permissionsRepository.save(permission);
  }

  async getPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }

  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return this.permissionsRepository.find({ where: { resource } });
  }

  // ============ Roles ============

  async createRole(
    organizationId: string,
    createRoleDto: CreateRoleDto,
  ): Promise<Role> {
    const existing = await this.rolesRepository.findOne({
      where: {
        organization_id: organizationId,
        name: createRoleDto.name,
      },
    });

    if (existing) {
      throw new BadRequestException('Role already exists in this organization');
    }

    const permissions = await this.permissionsRepository.find({
      where: { id: In(createRoleDto.permission_ids || []) },
    });

    const role = this.rolesRepository.create({
      id: uuidv4(),
      organization_id: organizationId,
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions,
    });

    return this.rolesRepository.save(role);
  }

  async getRole(roleId: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found`);
    }

    return role;
  }

  async getRolesByOrganization(organizationId: string): Promise<Role[]> {
    return this.rolesRepository.find({
      where: { organization_id: organizationId },
      relations: ['permissions'],
    });
  }

  async updateRole(
    roleId: string,
    updateData: Partial<Role>,
  ): Promise<Role> {
    const role = await this.getRole(roleId);
    Object.assign(role, updateData);
    return this.rolesRepository.save(role);
  }

  async addPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    const role = await this.getRole(roleId);
    const permission = await this.permissionsRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission ${permissionId} not found`);
    }

    if (!role.permissions) {
      role.permissions = [];
    }

    const hasPermission = role.permissions.some((p) => p.id === permissionId);
    if (!hasPermission) {
      role.permissions.push(permission);
    }

    return this.rolesRepository.save(role);
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    const role = await this.getRole(roleId);
    role.permissions = (role.permissions || []).filter(
      (p) => p.id !== permissionId,
    );
    return this.rolesRepository.save(role);
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await this.getRole(roleId);

    if (role.is_system_role) {
      throw new BadRequestException('Cannot delete system role');
    }

    await this.rolesRepository.remove(role);
  }

  // ============ Default Roles ============

  async initializeDefaultRoles(organizationId: string): Promise<void> {
    // Check if roles already exist
    const existing = await this.rolesRepository.findOne({
      where: { organization_id: organizationId, name: 'admin' },
    });

    if (existing) {
      return; // Already initialized
    }

    // Create default permissions if they don't exist
    const defaultPermissions = await this.createDefaultPermissions();

    // Create default roles
    const adminPermissions = defaultPermissions;
    const recruiterPermissions = defaultPermissions.filter(
      (p) =>
        p.resource !== 'organization' &&
        p.resource !== 'billing' &&
        p.action !== 'delete',
    );
    const employeePermissions = defaultPermissions.filter(
      (p) =>
        p.resource === 'job' ||
        p.resource === 'application' ||
        p.resource === 'profile',
    );

    // Admin Role
    await this.rolesRepository.save(
      this.rolesRepository.create({
        id: uuidv4(),
        organization_id: organizationId,
        name: 'admin',
        description: 'Organization administrator',
        permissions: adminPermissions,
      }),
    );

    // Recruiter Role
    await this.rolesRepository.save(
      this.rolesRepository.create({
        id: uuidv4(),
        organization_id: organizationId,
        name: 'recruiter',
        description: 'Recruiter',
        permissions: recruiterPermissions,
      }),
    );

    // Employee/Candidate Role
    await this.rolesRepository.save(
      this.rolesRepository.create({
        id: uuidv4(),
        organization_id: organizationId,
        name: 'employee',
        description: 'Employee/Candidate',
        permissions: employeePermissions,
      }),
    );
  }

  private async createDefaultPermissions(): Promise<Permission[]> {
    const resources = [
      'organization',
      'user',
      'job',
      'candidate',
      'application',
      'shift',
      'payment',
      'compliance',
    ];
    const actions = ['create', 'read', 'update', 'delete'];

    const permissions: Permission[] = [];

    for (const resource of resources) {
      for (const action of actions) {
        const name = `${resource}:${action}`;
        let existing = await this.permissionsRepository.findOne({
          where: { name },
        });

        if (!existing) {
          existing = await this.permissionsRepository.save(
            this.permissionsRepository.create({
              id: uuidv4(),
              name,
              description: `Permission to ${action} ${resource}`,
              resource,
              action,
              permission_type: 'system',
            }),
          );
        }

        permissions.push(existing);
      }
    }

    return permissions;
  }
}
