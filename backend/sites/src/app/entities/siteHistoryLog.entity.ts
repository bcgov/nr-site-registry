import { Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index
} from 'typeorm';
import { SaveSiteDetailsDTO } from '../dto/saveSiteDetails.dto';
import { BaseAuditEntity } from './baseAuditEntity';

@ObjectType()
@Entity('historylog')
@Index('idx_historylog_user_id', ['userId'])
export class HistoryLog extends BaseAuditEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('character varying', { name: 'user_id', length: 100 })
  userId: string;

  @Field()
  @Column('character varying', { name: 'site_id' })
  siteId: string;

  @Field(() => GraphQLJSON)
  @Column('jsonb', { name: 'snapshot_data' })
  content: SaveSiteDetailsDTO;
}
