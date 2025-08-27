import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
@Index('schedule2_reference_code', ['code'], { unique: true })
@Entity('schedule2_reference')
export class Schedule2Reference {
  @Field(() => Int, { nullable: false })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ nullable: false })
  @Column({ length: 10, nullable: false, unique: true })
  code: string;

  @Field({ nullable: false })
  @Column('character varying', {
    name: 'description',
    length: 255,
    nullable: false,
  })
  description: string;
}
