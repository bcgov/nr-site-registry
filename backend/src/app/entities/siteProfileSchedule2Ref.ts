import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
  Column,
} from 'typeorm';
import { ChangeAuditEntity } from './changeAuditEntity';
import { SiteProfiles } from './siteProfiles.entity';
import { Schedule2Reference } from './schedule2Reference';

@ObjectType()
@Unique(['profileId', 'schedule2ReferenceCode'])
@Entity('site_profile_schedule2_ref')
export class SiteProfileSchedule2Ref extends ChangeAuditEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Field()
  @Column({ name: 'schedule2_reference_code' })
  schedule2ReferenceCode: string;

  @Field()
  @Column({ name: 'site_profile_id' })
  profileId: string;

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

  @ManyToOne(
    () => SiteProfiles,
    (siteProfile) => siteProfile.siteProfileSchedule2Refs,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'site_profile_id', referencedColumnName: 'id' })
  siteProfile: SiteProfiles;

  @ManyToOne(() => Schedule2Reference)
  @JoinColumn({
    name: 'schedule2_reference_code',
    referencedColumnName: 'code',
  })
  schedule2Reference: Schedule2Reference;
}
