import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SiteDto {
  @Field()
  id: string;

  @Field()
  bcerCode: string;

  @Field()
  sstCode: string;

  @Field()
  commonName: string;

  @Field()
  addrType: string;

  @Field()
  addrLine_1: string;

  @Field({ nullable: true })
  addrLine_2?: string;

  @Field({ nullable: true })
  addrLine_3?: string;

  @Field({ nullable: true })
  addrLine_4?: string;

  @Field()
  city: string;

  @Field()
  provState: string;

  @Field({ nullable: true })
  postalCode?: string;

  @Field({ nullable: true })
  latdeg?: number;

  @Field({ nullable: true })
  longdeg?: number;

  @Field({ nullable: true })
  victoriaFileNo?: string;

  @Field({ nullable: true })
  regionalFileNo?: string;

  @Field({ nullable: true })
  classCode?: string;

  @Field({ nullable: true })
  generalDescription?: string;

  @Field()
  whoCreated: string;

  @Field({ nullable: true })
  whoUpdated?: string;

  @Field()
  whenCreated: Date;

  @Field({ nullable: true })
  whenUpdated?: Date;

  @Field()
  rwmFlag: number;

  @Field()
  rwmGeneralDescFlag: number;

  @Field({ nullable: true })
  consultantSubmitted?: string;

  @Field({ nullable: true })
  longDegrees?: number;

  @Field({ nullable: true })
  longMinutes?: number;

  @Field({ nullable: true })
  longSeconds?: number;

  @Field({ nullable: true })
  latDegrees?: number;

  @Field({ nullable: true })
  latMinutes?: number;

  @Field({ nullable: true })
  latSeconds?: number;

  @Field()
  srStatus: string;

  @Field()
  latlongReliabilityFlag: string;

  @Field()
  siteRiskCode: string;

  @Field({ nullable: true })
  geometry?: string;
}
