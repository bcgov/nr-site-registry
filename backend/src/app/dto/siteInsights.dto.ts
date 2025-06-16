import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SiteInsightsDto {
  @Field(() => Int)
  eventCount: number;

  @Field(() => Int)
  siteDocCount: number;

  @Field(() => Int)
  eventParticCount: number;

  @Field(() => Int)
  landHistoryCount: number;

  @Field(() => Int)
  siteAssocCount: number;

  @Field(() => Int)
  siteSubdivCount: number;
}
