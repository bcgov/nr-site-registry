import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sites } from './sites.entity';
import { BaseAuditEntity } from './baseAuditEntity';
import { Folio } from './folio.entity';

@ObjectType()
@Entity('folio_contents')
@Index('idx_folio_id', ['folioId'])
export class FolioContents extends BaseAuditEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('character varying', { name: 'site_id' })
  siteId: string;

  @Field()
  @Column('bigint', { name: 'folio_id' })
  folioId: string;

  @Field(() => Folio, { nullable: false })
  @ManyToOne(() => Folio, (folio) => folio.folioContents, { eager: true })
  @JoinColumn({ name: 'folio_id', referencedColumnName: 'id' })
  folio: Folio;

  @Field(() => Sites)
  @ManyToOne(() => Sites, (site) => site.cart, { eager: true })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site: Sites;
}
