import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@ObjectType()
@Entity('places')
export class Place {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('character varying', { name: 'name' })
  name: string;

  @Field()
  @Column('double precision', { name: 'latdeg' })
  latdeg: number;

  @Field()
  @Column('double precision', { name: 'longdeg' })
  longdeg: number;
}
