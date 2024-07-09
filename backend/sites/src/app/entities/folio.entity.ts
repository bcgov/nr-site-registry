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
import { FolioContents } from './folioContents.entity';

@ObjectType()
@Entity('folio')
@Index('idx_cart_user_id', ['userId'])
export class Folio extends BaseAuditEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('character varying', { name: 'user_id', length: 100 })
  userId: string;



  @Field()
  @Column("character varying", { name: "description", length: 500 })
  description: number;


  @Field(()=>[FolioContents], {nullable:true})
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  folioContents: FolioContents
  
}
