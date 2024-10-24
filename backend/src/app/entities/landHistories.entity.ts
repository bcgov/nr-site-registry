import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { LandUseCd } from './landUseCd.entity';
import { Sites } from './sites.entity';
import { ChangeAuditEntity } from './changeAuditEntity';

@ObjectType()
@Index('land_histories_pkey', ['lutCode', 'siteId'], { unique: true })
@Index('sluh_described_by_frgn', ['lutCode'], {})
@Index('sluh_rwm_flag', ['rwmFlag'], {})
@Index('sluh_rwm_note_flag', ['rwmNoteFlag'], {})
@Index('sluh_applicable_to_frgn', ['siteId'], {})
@Entity('land_histories')
export class LandHistories extends ChangeAuditEntity {
  @Field()
  @Column('bigint', { primary: true, name: 'site_id' })
  siteId: string;

  @Field()
  guid: string;

  @Field()
  @Column('character varying', { primary: true, name: 'lut_code', length: 6 })
  lutCode: string;

  @Field({ nullable: true })
  @Column('character varying', { name: 'note', nullable: true, length: 255 })
  note: string | null;

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

  @Field()
  @Column('smallint', { name: 'rwm_flag' })
  rwmFlag: number;

  @Field()
  @Column('smallint', { name: 'rwm_note_flag' })
  rwmNoteFlag: number;

  @Field({ nullable: true })
  @Column('character', { name: 'site_profile', nullable: true, length: 1 })
  siteProfile: string | null;

  @Field({ nullable: true })
  @Column('timestamp without time zone', {
    name: 'profile_date_received',
    nullable: true,
  })
  profileDateReceived: Date | null;

  @Field(() => LandUseCd)
  @ManyToOne(() => LandUseCd, (landUseCd) => landUseCd.landHistories, {
    eager: true,
  })
  @JoinColumn([{ name: 'lut_code', referencedColumnName: 'code' }])
  landUse: LandUseCd;

  @ManyToOne(() => Sites, (sites) => sites.landHistories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'site_id', referencedColumnName: 'id' }])
  site: Sites;
}
