import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
class BannerTypeData {
  @Field()
  bannerType: string;
}

@ObjectType()
export class BannerTypeResponse {
  @Field((type) => Int)
  httpStatusCode: number;

  @Field()
  message: string;

  @Field((type) => BannerTypeData, { nullable: true })
  data?: BannerTypeData;
}
