import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class SiteSummaryDTO extends ChangeAuditEntityDTO {
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
  addrLine_2: string | null;

  @Field({ nullable: true })
  addrLine_3: string | null;

  @Field({ nullable: true })
  addrLine_4: string | null;

  @Field()
  city: string;

  @Field()
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

  @Field()
  whoCreated: string;

  @Field({ nullable: true })
  whoUpdated: string | null;

  @Field()
  whenCreated: Date;

  @Field({ nullable: true })
  whenUpdated: Date | null;

  @Field()
  rwmFlag: number;

  @Field()
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

  @Field()
  srStatus: string;

  @Field()
  latlongReliabilityFlag: string;

  @Field()
  siteRiskCode: string;
}
