import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ParticRoleCd } from './particRoleCd.entity';
import { SitePartics } from './sitePartics.entity';
import { ChangeAuditEntity } from './changeAuditEntity';

@ObjectType()
@Index('spr_classified_by_frgn', ['prCode'], {})
@Index('site_partic_roles_pkey', ['prCode', 'spId'], { unique: true })
@Index('spr_rwm_flag', ['rwmFlag'], {})
@Index('spr_classifying_frgn', ['spId'], {})
@Index('sp_id', ['id'], {})
@Entity('site_partic_roles')
export class SiteParticRoles extends ChangeAuditEntity {
  // ADDED THIS PARIMARY KEY COLUMN AND REMOVE COMPOSITE PRIMARY KEY COLUMN
  // FOR CRUD OPERATION
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Field()
  @Column('character varying', { name: 'pr_code', length: 6 })
  prCode: string;

  @Field()
  @Column('bigint', { name: 'sp_id' })
  spId: string;

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

  @Field(() => ParticRoleCd)
  @ManyToOne(() => ParticRoleCd, (particRoleCd) => particRoleCd.siteParticRoles)
  @JoinColumn([{ name: 'pr_code', referencedColumnName: 'code' }])
  prCode2: ParticRoleCd;

  @ManyToOne(() => SitePartics, (sitePartics) => sitePartics.siteParticRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'sp_id', referencedColumnName: 'id' }])
  sp: SitePartics;
}
