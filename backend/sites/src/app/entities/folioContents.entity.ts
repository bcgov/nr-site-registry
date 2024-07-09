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
@Index('idx_cart_user_id', ['userId'])
export class FolioContents extends BaseAuditEntity {

    @Field()
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Field()
    @Column('character varying', { name: 'user_id', length: 100 })
    userId: string;
  
    @Field()
    @Column('character varying', { name: 'site_id' })
    siteId: string;

    @Field()
    @Column('character varying', { name: 'folio_id' })
    folioId: string;

    @Field()
    @ManyToOne(() => Folio, (folio) => folio.folioContents, {eager:true})
    @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
    folio: Folio;
  
    @Field()    
    @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
    site: Sites;

}
