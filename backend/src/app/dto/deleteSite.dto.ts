import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeleteSiteInput {
  @Field()
  @IsNotEmpty({ message: 'Site ID is required' })
  @IsString()
  siteId: string;
}

@ObjectType()
export class DeleteSiteResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  httpStatusCode?: number;

  @Field({ nullable: true })
  timestamp?: string;
}
