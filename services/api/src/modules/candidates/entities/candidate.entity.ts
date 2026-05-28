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

@Entity('candidates')
@Index(['organization_id'])
export class Candidate {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.candidates)
  organization: Organization;

  @Column('uuid')
  user_id: string;

  @Column('varchar', { nullable: true })
  resume_url: string;

  @Column('text', { nullable: true })
  summary: string;

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

  @Column('date', { nullable: true })
  available_from: Date;

  @Column('boolean', { default: false })
  willing_to_relocate: boolean;

  @Column('integer', { nullable: true })
  years_experience: number;

  @Column('varchar', { nullable: true })
  highest_education: string;

  @Column('varchar', { nullable: true })
  employment_status: string;

  @Column('jsonb', { default: {} })
  work_preferences: Record<string, any>;

  @Column('jsonb', { default: {} })
  salary_expectations: Record<string, any>;

  @Column('jsonb', { default: {} })
  skills: Record<string, any>;

  @Column('jsonb', { default: {} })
  certifications: Record<string, any>;

  @Column('jsonb', { default: {} })
  languages: Record<string, any>;

  @Column('jsonb', { default: {} })
  preferences: Record<string, any>;

  @Column('integer', { default: 0 })
  profile_completion_percentage: number;

  @Column('boolean', { default: false })
  verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
