import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Job } from '../../jobs/entities/job.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';

@Entity('organizations')
@Index(['slug'])
export class Organization {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { unique: true })
  slug: string;

  @Column('varchar', { default: 'free' })
  tier: string;

  @Column('varchar', { default: 'active' })
  status: string;

  @Column('varchar', { nullable: true })
  subscription_status: string;

  @Column('varchar', { nullable: true })
  stripe_customer_id: string;

  @Column('jsonb', { default: {} })
  settings: Record<string, any>;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Job, (job) => job.organization)
  jobs: Job[];

  @OneToMany(() => Candidate, (candidate) => candidate.organization)
  candidates: Candidate[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
