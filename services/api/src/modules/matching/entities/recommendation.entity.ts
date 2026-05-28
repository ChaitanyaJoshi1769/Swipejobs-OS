import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('recommendations')
@Index(['candidate_id', 'created_at'])
export class Recommendation {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  candidate_id: string;

  @Column('uuid')
  job_id: string;

  @Column('uuid')
  organization_id: string;

  @Column('integer')
  rank: number; // Position in recommendation list

  @Column('numeric', { precision: 5, scale: 4 })
  score: number; // 0.0000 to 1.0000

  @Column('varchar')
  model_version: string;

  @Column('jsonb', { default: {} })
  personalization_factors: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;
}
