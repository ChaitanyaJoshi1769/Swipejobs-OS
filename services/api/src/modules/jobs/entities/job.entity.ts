import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('jobs')
@Index(['organization_id', 'status'])
export class Job {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.jobs)
  organization: Organization;

  @Column('varchar')
  title: string;

  @Column('text')
  description: string;

  @Column('varchar', { nullable: true })
  slug: string;

  @Column('varchar', {
    enum: ['full-time', 'part-time', 'contract', 'temporary', 'gig'],
  })
  job_type: string;

  @Column('varchar', {
    enum: ['permanent', 'temporary', 'contract'],
  })
  employment_type: string;

  @Column('varchar', { default: 'open' })
  status: string;

  @Column('varchar', { default: 'public' })
  visibility: string;

  @Column('numeric', { nullable: true })
  salary_min: number;

  @Column('numeric', { nullable: true })
  salary_max: number;

  @Column('varchar', { default: 'USD' })
  salary_currency: string;

  @Column('varchar', { nullable: true })
  salary_frequency: string;

  @Column('varchar', { nullable: true })
  location_city: string;

  @Column('varchar', { nullable: true })
  location_state: string;

  @Column('varchar', { nullable: true })
  location_country: string;

  @Column('numeric', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('numeric', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column('varchar', { nullable: true })
  remote_work: string;

  @Column('jsonb', { default: {} })
  required_skills: Record<string, any>;

  @Column('jsonb', { default: {} })
  nice_to_have_skills: Record<string, any>;

  @Column('jsonb', { default: {} })
  required_certifications: Record<string, any>;

  @Column('integer', { nullable: true })
  years_experience_min: number;

  @Column('integer', { nullable: true })
  years_experience_max: number;

  @Column('varchar', { nullable: true })
  education_requirement: string;

  @Column('jsonb', { default: {} })
  language_requirements: Record<string, any>;

  @Column('varchar', { nullable: true })
  shift_type: string;

  @Column('time', { nullable: true })
  shift_time_start: string;

  @Column('time', { nullable: true })
  shift_time_end: string;

  @Column('text', { array: true, nullable: true })
  shift_days_of_week: string[];

  @Column('jsonb', { default: {} })
  benefits: Record<string, any>;

  @Column('jsonb', { default: {} })
  responsibilities: Record<string, any>;

  @Column('jsonb', { default: {} })
  requirements: Record<string, any>;

  @Column('uuid', { nullable: true })
  hiring_manager_id: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  posting_date: Date;

  @Column('timestamp', { nullable: true })
  closing_date: Date;

  @Column('timestamp', { nullable: true })
  filled_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
