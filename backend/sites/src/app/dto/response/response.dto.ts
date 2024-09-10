import { Field, Int, ObjectType } from '@nestjs/graphql';
import { format } from 'date-fns';

@ObjectType()
export class ResponseDto {
  constructor() {
    this.timestamp = new Date().toISOString();
  }

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Int, { nullable: true })
  httpStatusCode?: number;

  @Field(() => Boolean, { nullable: true })
  success?: boolean;

  @Field(() => String, { nullable: true })
  timestamp?: string;
}
