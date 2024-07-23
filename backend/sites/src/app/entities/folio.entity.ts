import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  } from 'typeorm';
import { Sites } from './sites.entity';
import { BaseAuditEntity } from './baseAuditEntity';
import { FolioContents } from './folioContents.entity';

@ObjectType()
@Entity('folio')
@Index('idx_folio_user_id', ['userId'])
export class Folio extends BaseAuditEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('character varying', { name: 'user_id', length: 100 })
  userId: string;

  @Field()
  @Column('character varying', { name: 'folio_id', length: 100 })
  folioId: string;

  @Field()
  @Column("character varying", { name: "description", length: 500 })
  description: string; 


  @Field(()=>[FolioContents], {nullable:true})
  @OneToMany(()=>FolioContents, (folio)=> folio.folio)
  @JoinColumn({ name: 'folio_content_id', referencedColumnName: 'id' })
  folioContents: FolioContents
  
}
