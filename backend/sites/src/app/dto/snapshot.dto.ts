import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class SnapshotDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  siteId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @Field(() => GraphQLJSON)
  snapshotData: any;
}
