import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ChangeAuditType } from './changeAuditEntity.dto';

@InputType({ isAbstract: true })
@ObjectType({ isAbstract: true })
export class SiteBaseDto extends ChangeAuditType {
  @Field()
  id: string;

  @Field({ nullable: true })
  bcerCode: string;

  @Field({ nullable: true })
  sstCode: string;

  @Field({ nullable: true })
  commonName: string;

  @Field({ nullable: true })
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

  @Field({ nullable: true })
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

  @Field({ nullable: true })
  whoCreated: string;

  @Field({ nullable: true })
  whoUpdated?: string;

  @Field({ nullable: true })
  whenCreated: Date;

  @Field({ nullable: true })
  whenUpdated?: Date;

  @Field({ nullable: true })
  rwmFlag: number;

  @Field({ nullable: true })
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

  @Field({ nullable: true })
  srStatus: string;

  @Field({ nullable: true })
  latlongReliabilityFlag: string;

  @Field({ nullable: true })
  siteRiskCode: string;

  @Field({ nullable: true })
  geometry?: string;
}
