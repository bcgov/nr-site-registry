import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { SiteDocPartics } from './siteDocPartics.entity';
import { Sites } from './sites.entity';
import { ChangeAuditEntity } from './changeAuditEntity';

@ObjectType()
@Index('site_docs_pkey', ['id'], { unique: true })
@Index('sdoc_rwm_flag', ['rwmFlag'], {})
@Index('sdoc_about_frgn', ['siteId'], {})
@Entity('site_docs')
export class SiteDocs extends ChangeAuditEntity {
  @Field()
  @Column('bigint', { primary: true, name: 'id' })
  id: string;

  @Field()
  @Column('bigint', { name: 'site_id' })
  siteId: string;

  @Field()
  @Column('timestamp without time zone', { name: 'submission_date' })
  submissionDate: Date;

  @Field({ nullable: true })
  @Column('timestamp without time zone', {
    name: 'document_date',
    nullable: true,
  })
  documentDate: Date | null;

  @Field()
  @Column('character varying', { name: 'title', length: 150 })
  title: string;

  @Field({ nullable: true })
  @Column('character varying', { name: 'note', nullable: true, length: 255 })
  note: string | null;

  @Field({ nullable: true })
  @Column('character varying', { name: 'filePath', nullable: true })
  filePath: string | null;

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

  @Field({ nullable: true })
  @Column('smallint', { name: 'rwm_note_flag', nullable: true })
  rwmNoteFlag: number | null;

  @Field(() => [SiteDocPartics])
  @OneToMany(() => SiteDocPartics, (siteDocPartics) => siteDocPartics.sdoc)
  siteDocPartics: SiteDocPartics[];

  @ManyToOne(() => Sites, (sites) => sites.siteDocs, { onDelete: 'CASCADE' })
  @JoinColumn([{ name: 'site_id', referencedColumnName: 'id' }])
  site: Sites;
}
