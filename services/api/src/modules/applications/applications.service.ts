import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  async create(
    organizationId: string,
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    // Check if candidate already applied for this job
    const existing = await this.applicationsRepository.findOne({
      where: {
        job_id: createApplicationDto.job_id,
        candidate_id: createApplicationDto.candidate_id,
      },
    });

    if (existing) {
      throw new BadRequestException('Candidate has already applied for this job');
    }

    const application = this.applicationsRepository.create({
      id: uuidv4(),
      organization_id: organizationId,
      ...createApplicationDto,
    });

    return this.applicationsRepository.save(application);
  }

  async findOne(id: string): Promise<Application> {
    const application = await this.applicationsRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }
    return application;
  }

  async findByJob(jobId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { job_id: jobId },
      order: { applied_at: 'DESC' },
    });
  }

  async findByCandidate(candidateId: string): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { candidate_id: candidateId },
      order: { applied_at: 'DESC' },
    });
  }

  async findByStatus(
    organizationId: string,
    status: string,
  ): Promise<Application[]> {
    return this.applicationsRepository.find({
      where: { organization_id: organizationId, status },
      order: { applied_at: 'DESC' },
    });
  }

  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    const application = await this.findOne(id);

    // Update status-specific fields
    if (updateApplicationDto.status === 'rejected') {
      updateApplicationDto.rejected_at = new Date();
    } else if (updateApplicationDto.status === 'hired') {
      updateApplicationDto.hired_at = new Date();
    } else if (updateApplicationDto.status === 'reviewed') {
      updateApplicationDto.reviewed_at = new Date();
    }

    Object.assign(application, updateApplicationDto);
    return this.applicationsRepository.save(application);
  }

  async getApplicationStats(organizationId: string): Promise<{
    total: number;
    submitted: number;
    reviewed: number;
    rejected: number;
    hired: number;
  }> {
    const total = await this.applicationsRepository.count({
      where: { organization_id: organizationId },
    });

    const submitted = await this.applicationsRepository.count({
      where: { organization_id: organizationId, status: 'submitted' },
    });

    const reviewed = await this.applicationsRepository.count({
      where: { organization_id: organizationId, status: 'reviewed' },
    });

    const rejected = await this.applicationsRepository.count({
      where: { organization_id: organizationId, status: 'rejected' },
    });

    const hired = await this.applicationsRepository.count({
      where: { organization_id: organizationId, status: 'hired' },
    });

    return { total, submitted, reviewed, rejected, hired };
  }

  async getApplicationsByStatus(
    jobId: string,
  ): Promise<{
    submitted: number;
    reviewed: number;
    rejected: number;
    hired: number;
  }> {
    const submitted = await this.applicationsRepository.count({
      where: { job_id: jobId, status: 'submitted' },
    });

    const reviewed = await this.applicationsRepository.count({
      where: { job_id: jobId, status: 'reviewed' },
    });

    const rejected = await this.applicationsRepository.count({
      where: { job_id: jobId, status: 'rejected' },
    });

    const hired = await this.applicationsRepository.count({
      where: { job_id: jobId, status: 'hired' },
    });

    return { submitted, reviewed, rejected, hired };
  }

  async bulkUpdateStatus(
    applicationIds: string[],
    status: string,
  ): Promise<void> {
    await this.applicationsRepository
      .createQueryBuilder()
      .update()
      .set({ status })
      .whereInIds(applicationIds)
      .execute();
  }
}
