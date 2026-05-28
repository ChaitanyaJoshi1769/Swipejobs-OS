import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['organization_id', 'name'])
export class Role {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  organization_id: string;

  @Column('varchar')
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('boolean', { default: false })
  is_system_role: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Permission[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
