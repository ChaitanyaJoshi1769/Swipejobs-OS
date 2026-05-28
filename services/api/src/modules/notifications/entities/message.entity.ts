import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('messages')
@Index(['sender_id', 'recipient_id'])
@Index(['conversation_id', 'created_at'])
export class Message {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  conversation_id: string;

  @Column('uuid')
  sender_id: string;

  @Column('uuid')
  recipient_id: string;

  @Column('text')
  content: string;

  @Column('varchar', { nullable: true })
  media_url?: string;

  @Column('boolean', { default: false })
  read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
