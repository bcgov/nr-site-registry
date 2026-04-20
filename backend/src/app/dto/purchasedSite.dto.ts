import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';

@ObjectType()
export class PurchasedSiteDto {
  @Field()
  siteId: string;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  purchaseDate: Date;

  @Field({ nullable: true })
  status: string;
}

@ObjectType()
export class PurchasedSitesResponse extends ResponseDto {
  @Field(() => [PurchasedSiteDto], { nullable: true })
  data: PurchasedSiteDto[] | null;

  @Field({ nullable: true })
  totalRecords: number;
}
