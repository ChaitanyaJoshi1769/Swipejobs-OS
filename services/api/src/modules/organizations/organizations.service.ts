import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,
  ) {}

  async create(createOrgDto: CreateOrganizationDto): Promise<Organization> {
    const existingOrg = await this.organizationsRepository.findOne({
      where: { slug: createOrgDto.slug },
    });

    if (existingOrg) {
      throw new BadRequestException('Organization slug already exists');
    }

    const organization = this.organizationsRepository.create({
      id: uuidv4(),
      name: createOrgDto.name,
      slug: createOrgDto.slug,
      tier: createOrgDto.tier || 'free',
      settings: createOrgDto.settings || {},
    });

    return this.organizationsRepository.save(organization);
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.organizationsRepository.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return org;
  }

  async findBySlug(slug: string): Promise<Organization> {
    const org = await this.organizationsRepository.findOne({ where: { slug } });
    if (!org) {
      throw new NotFoundException(`Organization with slug ${slug} not found`);
    }
    return org;
  }

  async update(
    id: string,
    updateOrgDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const org = await this.findOne(id);

    if (updateOrgDto.slug && updateOrgDto.slug !== org.slug) {
      const existingOrg = await this.organizationsRepository.findOne({
        where: { slug: updateOrgDto.slug },
      });
      if (existingOrg) {
        throw new BadRequestException('Organization slug already exists');
      }
    }

    Object.assign(org, updateOrgDto);
    return this.organizationsRepository.save(org);
  }

  async delete(id: string): Promise<void> {
    await this.organizationsRepository.softDelete(id);
  }
}
