import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('shift_assignments')
@Index(['shift_id', 'candidate_id'])
@Index(['organization_id', 'status'])
export class ShiftAssignment {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  shift_id: string;

  @Column('uuid')
  candidate_id: string;

  @Column('uuid')
  organization_id: string;

  @Column('varchar', { default: 'offered' })
  status: string; // offered, accepted, rejected, completed, no-show

  @Column('timestamp', { nullable: true })
  check_in_time?: Date;

  @Column('timestamp', { nullable: true })
  check_out_time?: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  hours_worked?: number;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
