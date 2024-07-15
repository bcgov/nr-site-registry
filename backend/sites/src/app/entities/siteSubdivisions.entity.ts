import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Sites } from './sites.entity';
import { Subdivisions } from './subdivisions.entity';

@ObjectType()
@Index(
  'site_subdivisions_site_id_subdiv_id_sprof_date_completed_key',
  ['siteId', 'sprofDateCompleted', 'subdivId'],
  {},
)
@Index('sitesub_part_or_all_of_frgn', ['siteId'], {})
@Index('site_subdivisions_pkey', ['siteSubdivId'], { unique: true })
@Index('sitesub_for_profile', ['sprofDateCompleted'], {})
@Index('sitesub_comprised_of_frgn', ['subdivId'], {})
@Entity('site_subdivisions')
export class SiteSubdivisions {
  @Field()
  @Column('bigint', { name: 'site_id' })
  siteId: string;

  @Field()
  @Column('bigint', { name: 'subdiv_id' })
  subdivId: string;

  @Field()
  @Column('timestamp without time zone', { name: 'date_noted' })
  dateNoted: Date;

  @Field()
  @Column('character varying', { name: 'initial_indicator', length: 1 })
  initialIndicator: string;

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
  @Column('timestamp without time zone', {
    name: 'sprof_date_completed',
    nullable: true,
  })
  sprofDateCompleted: Date | null;

  @Field()
  @Column('bigint', { primary: true, name: 'site_subdiv_id' })
  siteSubdivId: string;

  @Field()
  @Column('character varying', { name: 'send_to_sr', length: 1 })
  sendToSr: string;

  @ManyToOne(() => Sites, (sites) => sites.siteSubdivisions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'site_id', referencedColumnName: 'id' }])
  site: Sites;

  @ManyToOne(() => Subdivisions, (subdivisions) => subdivisions.siteSubdivisions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'subdiv_id', referencedColumnName: 'id' }])
  subdivision: Subdivisions;
}
