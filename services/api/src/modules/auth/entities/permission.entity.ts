import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['resource', 'action'])
export class Permission {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('varchar')
  resource: string;

  @Column('varchar')
  action: string;

  @Column('varchar', { default: 'user' })
  permission_type: string; // 'user', 'system'

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  created_at: Date;
}
