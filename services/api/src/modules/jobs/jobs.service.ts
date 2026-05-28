import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Job } from './entities/job.entity';
import { CreateJobDto } from './dtos/create-job.dto';
import { UpdateJobDto } from './dtos/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async create(organizationId: string, createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobsRepository.create({
      id: uuidv4(),
      organization_id: organizationId,
      ...createJobDto,
    });

    return this.jobsRepository.save(job);
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async findByOrganization(organizationId: string): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
    });
  }

  async findActive(organizationId: string): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { organization_id: organizationId, status: 'open' },
      order: { posting_date: 'DESC' },
    });
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);
    Object.assign(job, updateJobDto);
    return this.jobsRepository.save(job);
  }

  async delete(id: string): Promise<void> {
    await this.jobsRepository.softDelete(id);
  }

  async search(
    organizationId: string,
    query: string,
    limit = 20,
  ): Promise<Job[]> {
    return this.jobsRepository
      .createQueryBuilder('job')
      .where('job.organization_id = :organizationId', { organizationId })
      .andWhere(
        'job.title ILIKE :query OR job.description ILIKE :query',
        { query: `%${query}%` },
      )
      .andWhere('job.status = :status', { status: 'open' })
      .limit(limit)
      .getMany();
  }

  async findByLocation(
    organizationId: string,
    location: string,
    radiusKm = 50,
  ): Promise<Job[]> {
    // Simple location-based search (can be enhanced with PostGIS)
    return this.jobsRepository.find({
      where: {
        organization_id: organizationId,
        status: 'open',
      },
    });
  }

  async findByJobType(
    organizationId: string,
    jobType: string,
  ): Promise<Job[]> {
    return this.jobsRepository.find({
      where: {
        organization_id: organizationId,
        job_type: jobType,
        status: 'open',
      },
      order: { posting_date: 'DESC' },
    });
  }

  async findBySkills(
    organizationId: string,
    skills: string[],
  ): Promise<Job[]> {
    return this.jobsRepository
      .createQueryBuilder('job')
      .where('job.organization_id = :organizationId', { organizationId })
      .andWhere('job.status = :status', { status: 'open' })
      .andWhere(
        'job.required_skills ? ANY(:skills)',
        { skills },
      )
      .orderBy('job.posting_date', 'DESC')
      .getMany();
  }

  async findByExperience(
    organizationId: string,
    minYears: number,
    maxYears?: number,
  ): Promise<Job[]> {
    let query = this.jobsRepository
      .createQueryBuilder('job')
      .where('job.organization_id = :organizationId', { organizationId })
      .andWhere('job.status = :status', { status: 'open' })
      .andWhere('job.years_experience_max >= :minYears', { minYears });

    if (maxYears) {
      query = query.andWhere('job.years_experience_min <= :maxYears', {
        maxYears,
      });
    }

    return query.orderBy('job.posting_date', 'DESC').getMany();
  }

  async getJobStats(organizationId: string): Promise<{
    total: number;
    open: number;
    closed: number;
    filled: number;
  }> {
    const total = await this.jobsRepository.count({
      where: { organization_id: organizationId },
    });

    const open = await this.jobsRepository.count({
      where: { organization_id: organizationId, status: 'open' },
    });

    const closed = await this.jobsRepository.count({
      where: { organization_id: organizationId, status: 'closed' },
    });

    const filled = await this.jobsRepository.count({
      where: { organization_id: organizationId, status: 'filled' },
    });

    return { total, open, closed, filled };
  }
}
