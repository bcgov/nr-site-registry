import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm/decorator/columns/Column';

@ObjectType()
export class ChangeAuditEntity {
  @Field({ nullable: true })
  @Column('character varying', {
    name: 'user_action',
    length: 30,
    nullable: true,
    default: null,
  })
  userAction: string;

  @Field({ nullable: true })
  @Column('character varying', {
    name: 'sr_action',
    length: 30,
    nullable: true,
    default: null,
  })
  srAction: string;
}
