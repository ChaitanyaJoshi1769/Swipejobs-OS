import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('shifts')
@Index(['organization_id', 'shift_date'])
export class Shift {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid', { nullable: true })
  job_id: string;

  @Column('date')
  shift_date: Date;

  @Column('time')
  shift_time_start: string;

  @Column('time')
  shift_time_end: string;

  @Column('integer', { nullable: true })
  break_duration_minutes: number;

  @Column('jsonb', { default: {} })
  locations: Record<string, any>;

  @Column('integer')
  required_candidates: number;

  @Column('varchar', { default: 'open' })
  status: string;

  @Column('integer', { default: 0 })
  filled_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
