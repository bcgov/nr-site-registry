import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ConditionsText } from './conditionsText.entity';
import { EventPartics } from './eventPartics.entity';
import { EventTypeCd } from './eventTypeCd.entity';
import { Sites } from './sites.entity';
import { ChangeAuditEntity } from './changeAuditEntity';

@ObjectType()
@Index('event_described_by_frgn', ['eclsCode', 'etypCode'], {})
@Index('events_pkey', ['id'], { unique: true })
@Index('event_psnorg_frgn', ['psnorgId'], {})
@Index('event_rwm_flag', ['rwmFlag'], {})
@Index('event_rwm_note_flag', ['rwmNoteFlag'], {})
@Index('event_applicable_to_frgn', ['siteId'], {})
@Index('event_responsibility_of_frgn', ['spId'], {})
@Entity('events')
export class Events extends ChangeAuditEntity {
  @Field()
  @Column('bigint', { primary: true, name: 'id' })
  id: string;

  @Field()
  @Column('bigint', { name: 'site_id' })
  siteId: string;

  @Field()
  @Column('timestamp without time zone', { name: 'event_date' })
  eventDate: Date;

  @Field({ nullable: true })
  @Column('timestamp without time zone', {
    name: 'completion_date',
    nullable: true,
  })
  completionDate: Date | null;

  @Field()
  @Column('character varying', { name: 'etyp_code', length: 6 })
  etypCode: string;

  @Field()
  @Column('bigint', { name: 'psnorg_id' })
  psnorgId: string;

  @Field()
  @Column('bigint', { name: 'sp_id', nullable: true })
  spId: string | null;

  @Field({ nullable: true })
  @Column('character varying', {
    name: 'required_action',
    nullable: true,
    length: 500,
  })
  requiredAction: string | null;

  @Field({ nullable: true })
  @Column('character varying', { name: 'note', nullable: true, length: 500 })
  note: string | null;

  @Field({ nullable: true })
  @Column('character varying', {
    name: 'region_app_flag',
    nullable: true,
    length: 1,
  })
  regionAppFlag: string | null;

  @Field({ nullable: true })
  @Column('character varying', {
    name: 'region_userid',
    nullable: true,
    length: 16,
  })
  regionUserid: string | null;

  @Field({ nullable: true })
  @Column('timestamp without time zone', {
    name: 'region_date',
    nullable: true,
  })
  regionDate: Date | null;

  @Field()
  @Column('character varying', { name: 'who_created', length: 30 })
  whoCreated: string;

  @Field({ nullable: true })
  @Column('character varying', {
    name: 'who_updated',
    nullable: true,
    length: 30,
  })
  whoUpdated: string | null;

  @Field()
  @Column('timestamp without time zone', { name: 'when_created' })
  whenCreated: Date;

  @Field({ nullable: true })
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

  @Field({ nullable: true })
  @Column('timestamp without time zone', {
    name: 'rwm_approval_date',
    nullable: true,
  })
  rwmApprovalDate: Date | null;

  @Field()
  @Column('character varying', { name: 'ecls_code', length: 6 })
  eclsCode: string;

  @Field({ nullable: true })
  @Column('timestamp without time zone', {
    name: 'requirement_due_date',
    nullable: true,
  })
  requirementDueDate: Date | null;

  @Field({ nullable: true })
  @Column('timestamp without time zone', {
    name: 'requirement_received_date',
    nullable: true,
  })
  requirementReceivedDate: Date | null;

  @Field(() => [ConditionsText], { nullable: true })
  @OneToMany(() => ConditionsText, (conditionsText) => conditionsText.event)
  conditionsTexts: ConditionsText[];

  @Field(() => [EventPartics], { nullable: true })
  @OneToMany(() => EventPartics, (eventPartics) => eventPartics.event)
  eventPartics: EventPartics[];

  @Field(() => EventTypeCd)
  @ManyToOne(() => EventTypeCd, (eventTypeCd) => eventTypeCd.events)
  @JoinColumn([
    { name: 'etyp_code', referencedColumnName: 'code' },
    { name: 'ecls_code', referencedColumnName: 'eclsCode' },
  ])
  eventTypeCd: EventTypeCd;

  @Field(() => Sites)
  @ManyToOne(() => Sites, (sites) => sites.events, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'site_id', referencedColumnName: 'id' }])
  site: Sites;
}
