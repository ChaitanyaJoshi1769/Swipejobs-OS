import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('notifications')
@Index(['user_id', 'read'])
@Index(['user_id', 'created_at'])
export class Notification {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('varchar')
  type: string; // application_received, application_reviewed, job_match, message, shift_offered

  @Column('text')
  title: string;

  @Column('text')
  content: string;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column('boolean', { default: false })
  read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
