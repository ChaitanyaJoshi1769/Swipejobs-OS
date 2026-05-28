import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['organization_id', 'created_at'])
@Index(['user_id', 'created_at'])
@Index(['resource_type', 'action'])
export class AuditLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column('varchar')
  action: string;

  @Column('varchar')
  resource_type: string;

  @Column('uuid', { nullable: true })
  resource_id: string;

  @Column('varchar', { nullable: true })
  old_values: string; // JSON string

  @Column('varchar', { nullable: true })
  new_values: string; // JSON string

  @Column('varchar', { nullable: true })
  status: string; // 'success', 'failure'

  @Column('text', { nullable: true })
  error_message: string;

  @Column('inet', { nullable: true })
  ip_address: string;

  @Column('text', { nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}
