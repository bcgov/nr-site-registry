import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';

@ObjectType()
export class ResponseDto {
  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Int, { nullable: true })
  httpStatusCode?: number;

  @Field(() => Boolean, { nullable: true })
  success?: boolean;

  @Field(() => String, { nullable: true })
  timestamp?: String;
}
