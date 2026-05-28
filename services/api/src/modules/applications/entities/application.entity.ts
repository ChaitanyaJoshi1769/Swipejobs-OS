import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('applications')
@Index(['organization_id', 'job_id'])
@Index(['organization_id', 'candidate_id'])
@Index(['organization_id', 'status'])
export class Application {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  job_id: string;

  @Column('uuid')
  candidate_id: string;

  @Column('varchar', { default: 'submitted' })
  status: string; // submitted, reviewed, rejected, hired

  @Column('text', { nullable: true })
  cover_letter?: string;

  @CreateDateColumn()
  applied_at: Date;

  @Column('timestamp', { nullable: true })
  reviewed_at?: Date;

  @Column('timestamp', { nullable: true })
  rejected_at?: Date;

  @Column('timestamp', { nullable: true })
  hired_at?: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
