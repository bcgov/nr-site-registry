import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ltsa_record_audits')
@Index('ltsa_record_audits_created_idx', ['createdAt'])
@Index('ltsa_record_audits_run_idx', ['runId'])
export class LtsaRecordAudit {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('bigint', { name: 'run_id' })
  runId: string;

  @Column('bigint', { name: 'source_record_id' })
  sourceRecordId: string;

  @Column('character varying', { name: 'target_table', length: 40 })
  targetTable: string;

  @Column('bigint', { name: 'target_id', nullable: true })
  targetId: string | null;

  @Column('character varying', { name: 'action', length: 16 })
  action: 'insert' | 'update';

  @Column('jsonb', { name: 'before_value', nullable: true })
  beforeValue: Record<string, unknown> | null;

  @Column('jsonb', { name: 'after_value' })
  afterValue: Record<string, unknown>;

  @Column('timestamp with time zone', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
