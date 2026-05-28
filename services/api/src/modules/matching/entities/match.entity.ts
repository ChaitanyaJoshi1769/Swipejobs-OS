import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('matches')
@Index(['job_id', 'match_score'])
@Index(['candidate_id'])
export class Match {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  job_id: string;

  @Column('uuid')
  candidate_id: string;

  @Column('uuid')
  organization_id: string;

  @Column('numeric', { precision: 5, scale: 4 })
  match_score: number; // 0.0000 to 1.0000

  @Column('integer')
  match_percentage: number; // 0-100

  @Column('varchar')
  matching_model_version: string;

  @Column('jsonb', { default: {} })
  match_reasons: Record<string, any>;

  @Column('timestamp')
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
