import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { DocParticRoleCd } from './docParticRoleCd.entity';
import { PeopleOrgs } from './peopleOrgs.entity';
import { SiteDocs } from './siteDocs.entity';
import { SitePartics } from './sitePartics.entity';
import { ChangeAuditEntity } from './changeAuditEntity';

@ObjectType()
@Index('sdp_classified_by_frgn', ['dprCode'], {})
@Index(
  'site_doc_partics_sdoc_id_psnorg_id_dpr_code_key',
  ['dprCode', 'psnorgId', 'sdocId'],
  { unique: true },
)
@Index('site_doc_partics_pkey', ['id'], { unique: true })
@Index('sdp_psnorg_frgn', ['psnorgId'], {})
@Index('sdp_rwm_flag', ['rwmFlag'], {})
@Index('sdp_playing_a_role_i_frgn', ['sdocId'], {})
@Index('sdp_played_by_frgn', ['spId'], {})
@Entity('site_doc_partics')
export class SiteDocPartics extends ChangeAuditEntity {
  @Field()
  @Column('bigint', { primary: true, name: 'id' })
  id: string;

  // @Field()
  // @Column('character varying', { name: 'dpr_code', unique: true, length: 6 })
  // dprCode: string;

  //Need to remove unique constraint because as per stand-up discussion everyone
  // will be ATH i.e Author. I would suggest to keep this null able as we don't have
  // UI for dpr code.
  @Field()
  @Column('character varying', { name: 'dpr_code', length: 6 })
  dprCode: string;

  @Field()
  @Column('bigint', { name: 'sdoc_id', unique: true })
  sdocId: string;

  //make it nullable in order todo  CRUD opertaions
  //keeping this for historical data but for new entries this will be null always.
  @Field()
  @Column('bigint', { name: 'sp_id', nullable: true })
  spId: string;

  @Field()
  @Column('bigint', { name: 'psnorg_id', unique: true })
  psnorgId: string;

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

  //Make this nullable because we are not using it anymore and keeing it for
  //historical data
  @Field({ nullable: true })
  @Column('smallint', { name: 'rwm_flag', nullable: true })
  rwmFlag: number | null;

  @Field(() => DocParticRoleCd)
  @ManyToOne(
    () => DocParticRoleCd,
    (docParticRoleCd) => docParticRoleCd.siteDocPartics,
  )
  @JoinColumn([{ name: 'dpr_code', referencedColumnName: 'code' }])
  dprCode2: DocParticRoleCd;

  @Field(() => PeopleOrgs)
  @ManyToOne(() => PeopleOrgs, (peopleOrgs) => peopleOrgs.siteDocPartics)
  @JoinColumn([{ name: 'psnorg_id', referencedColumnName: 'id' }])
  psnorg: PeopleOrgs;

  @ManyToOne(() => SiteDocs, (siteDocs) => siteDocs.siteDocPartics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'sdoc_id', referencedColumnName: 'id' }])
  sdoc: SiteDocs;

  //Removed this relationship as we don't have any UI for site participant.
  // @ManyToOne(() => SitePartics, (sitePartics) => sitePartics.siteDocPartics, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn([{ name: 'sp_id', referencedColumnName: 'id' }])
  // sp: SitePartics;
}
