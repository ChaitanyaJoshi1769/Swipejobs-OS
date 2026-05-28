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
}
