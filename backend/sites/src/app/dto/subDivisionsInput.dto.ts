import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class SubDivisionsInputDTO extends ChangeAuditEntityDTO {
  @Field()
  id: string;

  @Field()
  dateNoted: Date;

  @Field()
  pin: string | null;

  @Field()
  pid: string | null;

  @Field()
  bcaaFolioNumber: string | null;

  @Field()
  entityType: string | null;

  @Field()
  addrLine_1: string | null;

  @Field()
  addrLine_2: string | null;

  @Field()
  addrLine_3: string | null;

  @Field()
  addrLine_4: string | null;

  @Field()
  city: string | null;

  @Field()
  postalCode: string | null;

  @Field()
  legalDescription: string | null;

  @Field()
  whoCreated: string;

  @Field()
  whoUpdated: string | null;

  @Field()
  whenCreated: Date;

  @Field()
  whenUpdated: Date | null;

  @Field()
  crownLandsFileNo: string | null;

  @Field()
  pidStatusCd: string;

  @Field()
  validPid: string | null;
}
