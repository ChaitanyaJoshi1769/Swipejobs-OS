import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_roles')
@Index(['user_id', 'organization_id'])
export class UserRole {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  role_id: string;

  @Column('uuid')
  organization_id: string;

  @CreateDateColumn()
  created_at: Date;
}
