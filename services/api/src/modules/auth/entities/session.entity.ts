import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('sessions')
@Index(['user_id'])
export class Session {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;

  @Column('varchar', { unique: true })
  refresh_token_hash: string;

  @Column('inet', { nullable: true })
  ip_address: string;

  @Column('text', { nullable: true })
  user_agent: string;

  @Column('timestamp')
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
