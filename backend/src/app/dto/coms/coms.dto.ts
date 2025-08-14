import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Coms {
  @Field()
  bucketId: string;
}
