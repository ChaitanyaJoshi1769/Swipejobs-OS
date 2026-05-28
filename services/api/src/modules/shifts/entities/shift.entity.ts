import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('shifts')
@Index(['organization_id', 'job_id'])
@Index(['organization_id', 'status'])
export class Shift {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid')
  job_id: string;

  @Column('timestamp')
  start_time: Date;

  @Column('timestamp')
  end_time: Date;

  @Column('varchar', { default: 'open' })
  status: string; // open, assigned, completed, cancelled

  @Column('int', { default: 1 })
  positions_available: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  pay_rate?: number;

  @Column('text', { nullable: true })
  requirements?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
