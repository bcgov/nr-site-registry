import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sites } from './sites.entity';
import { ChangeAuditEntity } from './changeAuditEntity';

@ObjectType()
@Index('sa_rwm_flag', ['rwmFlag'], {})
@Index('sa_rwm_note_flag', ['rwmNoteFlag'], {})
@Index('sa_adjacent_to_frgn', ['siteId'], {})
@Index('site_assocs_pkey', ['siteId', 'siteIdAssociatedWith'], { unique: true })
@Index('sa_associated_with_frgn', ['siteIdAssociatedWith'], {})
@Entity('site_assocs')
export class SiteAssocs extends ChangeAuditEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  // @Field()
  // @Column('bigint', { primary: true, name: 'site_id' })
  // siteId: string;

  // @Field()
  // @Column('bigint', { primary: true, name: 'site_id_associated_with' })
  // siteIdAssociatedWith: string;

  //Remove the primary key combination because siteIdAssociatedWith can be updated as per current design
  @Field()
  @Column('bigint', { name: 'site_id' })
  siteId: string;

  //Remove the primary key combination because siteIdAssociatedWith can be updated as per current design
  @Field()
  @Column('bigint', { name: 'site_id_associated_with' })
  siteIdAssociatedWith: string;

  @Field()
  @Column('timestamp without time zone', { name: 'effective_date' })
  effectiveDate: Date;

  @Field()
  @Column('character varying', { name: 'note', nullable: true, length: 255 })
  note: string | null;

  @Field()
  @Column('character varying', { name: 'who_created', length: 30 })
  whoCreated: string;

  @Field()
  @Column('character varying', {
    name: 'who_updated',
    nullable: true,
    length: 30,
  })
  whoUpdated: string | null;

  @Field()
  @Column('timestamp without time zone', { name: 'when_created' })
  whenCreated: Date;

  @Field()
  @Column('timestamp without time zone', {
    name: 'when_updated',
    nullable: true,
  })
  whenUpdated: Date | null;

  //Make this nullable because we are not using it anymore and keeing it for historical data
  @Field({ nullable: true })
  @Column('smallint', { name: 'rwm_flag', nullable: true })
  rwmFlag: number | null;

  //Make this nullable because we are not using it anymore and keeing it for historical data
  @Field({ nullable: true })
  @Column('smallint', { name: 'rwm_note_flag', nullable: true })
  rwmNoteFlag: number | null;

  @Field()
  @Column('character varying', { name: 'common_pid', length: 1 })
  commonPid: string;

  @ManyToOne(() => Sites, (sites) => sites.siteAssocs, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'site_id', referencedColumnName: 'id' }])
  site: Sites;

  @ManyToOne(() => Sites, (sites) => sites.siteAssocs2, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'site_id_associated_with', referencedColumnName: 'id' }])
  siteIdAssociatedWith2: Sites;
}
