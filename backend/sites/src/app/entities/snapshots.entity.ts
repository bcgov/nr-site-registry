import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Sites } from './sites.entity';
import GraphQLJSON from 'graphql-type-json';
import { SnapshotSiteContent } from '../dto/snapshotSiteContent';
import { BaseAuditEntity } from './baseAuditEntity';

@ObjectType()
@Entity('snapshots')
@Index('idx_snapshot_user_id', ['userId'])
@Index('idx_snapshot', ['transactionId', 'userId', 'siteId'], { unique: true })
export class Snapshots extends BaseAuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('character varying', { name: 'user_id', length: 100 })
  userId: string;

  @Field()
  @Column('character varying', { name: 'site_id' })
  siteId: string;

  @Field()
  @Column('character varying', { name: 'transaction_id' })
  transactionId: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { name: 'snapshot_data' })
  snapshotData: SnapshotSiteContent;

  @ManyToOne(() => Sites, (site) => site.snapshots)
  @JoinColumn({ name: 'site_id', referencedColumnName: 'id' })
  site: Sites;
}
