import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from './entities/candidate.entity';
import { CreateCandidateDto } from './dtos/create-candidate.dto';
import { UpdateCandidateDto } from './dtos/update-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async create(
    organizationId: string,
    userId: string,
    createCandidateDto: CreateCandidateDto,
  ): Promise<Candidate> {
    const candidate = this.candidatesRepository.create({
      id: uuidv4(),
      organization_id: organizationId,
      user_id: userId,
      ...createCandidateDto,
    });

    return this.candidatesRepository.save(candidate);
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({ where: { id } });
    if (!candidate) {
      throw new NotFoundException(`Candidate ${id} not found`);
    }
    return candidate;
  }

  async findByUserId(userId: string): Promise<Candidate> {
    const candidate = await this.candidatesRepository.findOne({
      where: { user_id: userId },
    });
    if (!candidate) {
      throw new NotFoundException(`Candidate for user ${userId} not found`);
    }
    return candidate;
  }

  async findByOrganization(organizationId: string): Promise<Candidate[]> {
    return this.candidatesRepository.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, updateDto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.findOne(id);
    Object.assign(candidate, updateDto);
    return this.candidatesRepository.save(candidate);
  }

  async findBySkills(
    organizationId: string,
    skills: string[],
  ): Promise<Candidate[]> {
    return this.candidatesRepository
      .createQueryBuilder('candidate')
      .where('candidate.organization_id = :organizationId', { organizationId })
      .andWhere('candidate.skills ? ANY(:skills)', { skills })
      .orderBy('candidate.created_at', 'DESC')
      .getMany();
  }

  async findByLocation(
    organizationId: string,
    location: string,
  ): Promise<Candidate[]> {
    return this.candidatesRepository
      .createQueryBuilder('candidate')
      .where('candidate.organization_id = :organizationId', { organizationId })
      .andWhere(
        '(candidate.location_city ILIKE :location OR candidate.location_state ILIKE :location OR candidate.location_country ILIKE :location)',
        { location: `%${location}%` },
      )
      .orderBy('candidate.created_at', 'DESC')
      .getMany();
  }

  async findByExperience(
    organizationId: string,
    minYears: number,
    maxYears?: number,
  ): Promise<Candidate[]> {
    let query = this.candidatesRepository
      .createQueryBuilder('candidate')
      .where('candidate.organization_id = :organizationId', { organizationId })
      .andWhere('candidate.years_experience >= :minYears', { minYears });

    if (maxYears) {
      query = query.andWhere('candidate.years_experience <= :maxYears', {
        maxYears,
      });
    }

    return query.orderBy('candidate.created_at', 'DESC').getMany();
  }

  async findAvailable(organizationId: string): Promise<Candidate[]> {
    return this.candidatesRepository.find({
      where: {
        organization_id: organizationId,
        employment_status: 'available',
      },
      order: { profile_completion_percentage: 'DESC' },
    });
  }

  async getCandidateStats(organizationId: string): Promise<{
    total: number;
    verified: number;
    available: number;
    complete_profiles: number;
  }> {
    const total = await this.candidatesRepository.count({
      where: { organization_id: organizationId },
    });

    const verified = await this.candidatesRepository.count({
      where: { organization_id: organizationId, verified: true },
    });

    const available = await this.candidatesRepository.count({
      where: {
        organization_id: organizationId,
        employment_status: 'available',
      },
    });

    const complete_profiles = await this.candidatesRepository.count({
      where: {
        organization_id: organizationId,
        profile_completion_percentage: 100,
      },
    });

    return { total, verified, available, complete_profiles };
  }

  async updateProfileCompletion(candidateId: string): Promise<Candidate> {
    const candidate = await this.findOne(candidateId);

    // Calculate profile completion percentage
    let completionScore = 0;
    const fields = [
      'resume_url',
      'summary',
      'location_city',
      'location_country',
      'years_experience',
      'highest_education',
      'employment_status',
      'skills',
    ];

    for (const field of fields) {
      if (candidate[field]) {
        completionScore += 12.5; // 8 fields = 100%
      }
    }

    candidate.profile_completion_percentage = Math.min(100, Math.round(completionScore));
    return this.candidatesRepository.save(candidate);
  }
}
