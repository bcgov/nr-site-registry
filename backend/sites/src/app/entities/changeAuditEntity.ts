import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm/decorator/columns/Column';

@ObjectType()
export class ChangeAuditEntity {
  @Field()
  @Column('character varying', {
    name: 'user_action',
    length: 30,
    nullable: true,
  })
  userAction: string;

  @Field()
  @Column('character varying', {
    name: 'sr_action',
    length: 30,
    nullable: true,
  })
  srAction: string;
}
