import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Session } from '../../auth/entities/session.entity';

@Entity('users')
@Index(['organization_id', 'email'])
@Index(['email'])
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @ManyToOne(() => Organization, (org) => org.users)
  organization: Organization;

  @Column('varchar', { unique: true })
  email: string;

  @Column('varchar')
  password_hash: string;

  @Column('varchar', { nullable: true })
  first_name: string;

  @Column('varchar', { nullable: true })
  last_name: string;

  @Column('varchar', { nullable: true })
  profile_image_url: string;

  @Column('varchar', { nullable: true })
  phone: string;

  @Column('varchar', {
    type: 'varchar',
    enum: ['candidate', 'employer', 'recruiter', 'admin'],
  })
  user_type: 'candidate' | 'employer' | 'recruiter' | 'admin';

  @Column('varchar', { default: 'active' })
  status: string;

  @Column('boolean', { default: false })
  email_verified: boolean;

  @Column('timestamp', { nullable: true })
  email_verified_at: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
