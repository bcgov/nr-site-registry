import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class SiteSummaryDTO extends ChangeAuditEntityDTO {
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
  addrLine_2: string | null;

  @Field({ nullable: true })
  addrLine_3: string | null;

  @Field({ nullable: true })
  addrLine_4: string | null;

  @Field()
  city: string;

  @Field({ nullable: true })
  provState: string;

  @Field({ nullable: true })
  postalCode: string | null;

  @Field({ nullable: true })
  latdeg: number | null;

  @Field({ nullable: true })
  longdeg: number | null;

  @Field({ nullable: true })
  victoriaFileNo: string | null;

  @Field({ nullable: true })
  regionalFileNo: string | null;

  @Field({ nullable: true })
  classCode: string | null;

  @Field({ nullable: true })
  generalDescription: string | null;

  @Field({ nullable: true })
  whoCreated: string;

  @Field({ nullable: true })
  whoUpdated: string | null;

  @Field({ nullable: true })
  whenCreated: Date;

  @Field({ nullable: true })
  whenUpdated: Date | null;

  @Field({ nullable: true })
  rwmFlag: number;

  @Field({ nullable: true })
  rwmGeneralDescFlag: number;

  @Field({ nullable: true })
  consultantSubmitted: string | null;

  @Field({ nullable: true })
  longDegrees: number | null;

  @Field({ nullable: true })
  longMinutes: number | null;

  @Field({ nullable: true })
  longSeconds: string | null;

  @Field({ nullable: true })
  latDegrees: number | null;

  @Field({ nullable: true })
  latMinutes: number | null;

  @Field({ nullable: true })
  latSeconds: string | null;

  @Field({ nullable: true })
  srStatus: string;

  @Field({ nullable: true })
  latlongReliabilityFlag: string;

  @Field({ nullable: true })
  siteRiskCode: string;
}
