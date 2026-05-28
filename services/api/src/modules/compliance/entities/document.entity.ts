import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('documents')
@Index(['candidate_id', 'type'])
@Index(['organization_id', 'status'])
export class Document {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  candidate_id: string;

  @Column('uuid')
  organization_id: string;

  @Column('varchar')
  type: string; // driver_license, passport, ssn, work_authorization, tax_form

  @Column('varchar')
  document_url: string;

  @Column('varchar', { default: 'pending' })
  status: string; // pending, approved, rejected, expired

  @Column('text', { nullable: true })
  verification_notes?: string;

  @Column('timestamp', { nullable: true })
  verified_at?: Date;

  @Column('varchar', { nullable: true })
  verified_by?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
