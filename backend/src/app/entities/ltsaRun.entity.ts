import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type LtsaRunStatus = 'processing' | 'success' | 'warning' | 'failed';
export type LtsaOperation = 'dump_1' | 'dump_2' | 'load';

@Entity('ltsa_runs')
@Index('ltsa_runs_operation_status_completed_idx', [
  'operation',
  'status',
  'completedAt',
])
@Index('ltsa_runs_checksum_success_idx', [
  'operation',
  'fileChecksum',
  'status',
])
export class LtsaRun {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('character varying', { name: 'operation', length: 16 })
  operation: LtsaOperation;

  @Column('character varying', { name: 'status', length: 16 })
  status: LtsaRunStatus;

  @Column('character varying', {
    name: 'filename',
    nullable: true,
    length: 255,
  })
  filename: string | null;

  @Column('bigint', { name: 'file_size', nullable: true })
  fileSize: string | null;

  @Column('character varying', {
    name: 'file_checksum',
    nullable: true,
    length: 64,
  })
  fileChecksum: string | null;

  @Column('bigint', { name: 'previous_successful_run_id', nullable: true })
  previousSuccessfulRunId: string | null;

  @Column('bigint', { name: 'duplicate_of_run_id', nullable: true })
  duplicateOfRunId: string | null;

  @Column('timestamp with time zone', {
    name: 'started_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  startedAt: Date;

  @Column('timestamp with time zone', { name: 'completed_at', nullable: true })
  completedAt: Date | null;

  @Column('integer', { name: 'records_seen', default: 0 })
  recordsSeen: number;

  @Column('integer', { name: 'records_returned', default: 0 })
  recordsReturned: number;

  @Column('integer', { name: 'records_loaded', default: 0 })
  recordsLoaded: number;

  @Column('integer', { name: 'malformed_records', default: 0 })
  malformedRecords: number;

  @Column('integer', { name: 'changed_records', default: 0 })
  changedRecords: number;

  @Column('integer', { name: 'subdivision_updates', default: 0 })
  subdivisionUpdates: number;

  @Column('integer', { name: 'subdivision_inserts', default: 0 })
  subdivisionInserts: number;

  @Column('integer', { name: 'site_subdivision_inserts', default: 0 })
  siteSubdivisionInserts: number;

  @Column('text', { name: 'warning_message', nullable: true })
  warningMessage: string | null;

  @Column('text', { name: 'error_message', nullable: true })
  errorMessage: string | null;

  @Column('character varying', {
    name: 'error_category',
    nullable: true,
    length: 32,
  })
  errorCategory: string | null;
}
