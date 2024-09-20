import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventParticRoleCd } from './eventParticRoleCd.entity';
import { Events } from './events.entity';
import { PeopleOrgs } from './peopleOrgs.entity';
import { SitePartics } from './sitePartics.entity';
import { ChangeAuditEntity } from './changeAuditEntity';

@ObjectType()
@Index('event_partics_pkey', ['eprCode', 'eventId', 'psnorgId'], {
  unique: true,
})
@Index('ep_classified_by_frgn', ['eprCode'], {})
@Index('ep_playing_a_role_i_frgn', ['eventId'], {})
@Index('ep_psnorg_frgn', ['psnorgId'], {})
@Index('ep_rwm_flag', ['rwmFlag'], {})
@Index('ep_played_by_frgn', ['spId'], {})
@Index('ep_id', ['id'], {})
@Entity('event_partics')
export class EventPartics extends ChangeAuditEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Field()
  @Column('bigint', { name: 'event_id' })
  eventId: string;

  @Field()
  @Column('bigint', { name: 'sp_id', nullable: true })
  spId: string | null;

  @Field()
  @Column('character varying', { name: 'epr_code', length: 6 })
  eprCode: string;

  @Field()
  @Column('bigint', { name: 'psnorg_id' })
  psnorgId: string;

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

  @Field()
  @Column('smallint', { name: 'rwm_flag' })
  rwmFlag: number;

  @ManyToOne(
    () => EventParticRoleCd,
    (eventParticRoleCd) => eventParticRoleCd.eventPartics,
  )
  @JoinColumn([{ name: 'epr_code', referencedColumnName: 'code' }])
  eprCode2: EventParticRoleCd;

  @ManyToOne(() => Events, (events) => events.eventPartics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'event_id', referencedColumnName: 'id' }])
  event: Events;

  @Field(() => PeopleOrgs, { nullable: true })
  @ManyToOne(() => PeopleOrgs, (peopleOrgs) => peopleOrgs.eventPartics)
  @JoinColumn([{ name: 'psnorg_id', referencedColumnName: 'id' }])
  psnorg: PeopleOrgs;

  // Remove this relationship because event participant is no longer depend on site participant.
  //  In case there will migration issue we can uncomment this code
  // @ManyToOne(() => SitePartics, (sitePartics) => sitePartics.eventPartics, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn([{ name: 'sp_id', referencedColumnName: 'id' }])
  // sp: SitePartics;
}
