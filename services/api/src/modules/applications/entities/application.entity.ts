import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('applications')
@Index(['job_id', 'candidate_id'])
export class Application {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  job_id: string;

  @Column('uuid')
  candidate_id: string;

  @Column('uuid')
  organization_id: string;

  @Column('varchar', { default: 'submitted' })
  status: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  applied_at: Date;

  @Column('timestamp', { nullable: true })
  reviewed_at: Date;

  @Column('timestamp', { nullable: true })
  interview_scheduled_at: Date;

  @Column('timestamp', { nullable: true })
  rejected_at: Date;

  @Column('timestamp', { nullable: true })
  hired_at: Date;

  @Column('text', { nullable: true })
  rejection_reason: string;

  @Column('text', { nullable: true })
  recruiter_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
