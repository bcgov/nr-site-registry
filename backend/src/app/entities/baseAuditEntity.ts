import { Field, ObjectType } from '@nestjs/graphql';
import { Column } from 'typeorm/decorator/columns/Column';
import { CreateDateColumn } from 'typeorm/decorator/columns/CreateDateColumn';
import { UpdateDateColumn } from 'typeorm/decorator/columns/UpdateDateColumn';

@ObjectType()
export class BaseAuditEntity {
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
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'when_created',
  })
  whenCreated: Date;

  @Field({ nullable: true })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'when_updated',
  })
  whenUpdated: Date | null;
}
