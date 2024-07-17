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

@ObjectType()
@Entity('cart')
@Index('idx_cart_user_id', ['userId'])
export class Cart extends BaseAuditEntity {
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
  @Column('double precision', { name: 'price' })
  price: number;

  @Field(() => Sites, { nullable: true })
  @ManyToOne(() => Sites, (site) => site.cart, { eager: true })
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site: Sites;
}
