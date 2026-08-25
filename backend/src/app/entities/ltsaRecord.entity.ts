import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ltsa_records')
@Index('ltsa_records_run_idx', ['runId'])
@Index('ltsa_records_run_pid_idx', ['runId', 'pid'])
export class LtsaRecord {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: string;

  @Column('bigint', { name: 'run_id' })
  runId: string;

  @Column('integer', { name: 'line_number' })
  lineNumber: number;

  @Column('character varying', { name: 'pid', length: 9 })
  pid: string;

  @Column('character varying', {
    name: 'pid_status_cd',
    nullable: true,
    length: 1,
  })
  pidStatusCd: string | null;

  @Column('character varying', {
    name: 'legal_description',
    nullable: true,
    length: 255,
  })
  legalDescription: string | null;

  @Column('character varying', {
    name: 'child_pid',
    nullable: true,
    length: 9,
  })
  childPid: string | null;

  @Column('character varying', {
    name: 'child_pid_status_cd',
    nullable: true,
    length: 1,
  })
  childPidStatusCd: string | null;

  @Column('character varying', {
    name: 'child_legal_description',
    nullable: true,
    length: 255,
  })
  childLegalDescription: string | null;
}
