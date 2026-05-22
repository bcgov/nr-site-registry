import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import {
  ChangeAuditEntityDTO,
  ChangeAuditObjectTypeDTO,
} from './changeAuditEntity.dto';

@ObjectType()
export class DisclosureResponse extends ResponseDto {
  @Field(() => [SiteProfilesDTO], { nullable: true })
  data: SiteProfilesDTO[] | null;
}

@ObjectType()
export class SiteProfilesDTO extends ChangeAuditObjectTypeDTO {
  @Field()
  id: string;

  @Field({ nullable: true })
  siteId?: string | null;

  @Field()
  dateCompleted: Date;

  @Field({ nullable: true })
  rwmDateDecision: Date | null;

  @Field({ nullable: true })
  localAuthDateRecd: Date | null;

  @Field({ nullable: true })
  siteRegDateRecd: Date | null;

  @Field({ nullable: true })
  siteRegDateEntered: Date | null;

  @Field({ nullable: true })
  localAuthDateSubmitted: Date | null;

  @Field({ nullable: true })
  localAuthDateForwarded: Date | null;

  @Field({ nullable: true })
  rwmDateReceived: Date | null;

  @Field({ nullable: true })
  rwmParticId: string | null;

  @Field({ nullable: true })
  plannedActivityComment: string | null;

  @Field({ nullable: true })
  siteDisclosureComment: string | null;

  @Field({ nullable: true })
  govDocumentsComment: string | null;

  @Field({ nullable: true })
  whenCreated: Date | null;

  @Field({ nullable: true })
  whenUpdated: Date | null;

  @Field(() => [SiteProfileSchedule2RefDTO], { nullable: true })
  siteProfileSchedule2Refs?: SiteProfileSchedule2RefDTO[] | null;
}

// Output DTO — keeps the original field names the frontend expects.
// Backed by SiteProfileLandUses table; schedule2ReferenceCode maps to lutCode.
@ObjectType()
export class SiteProfileSchedule2RefDTO extends ChangeAuditObjectTypeDTO {
  @Field()
  id: string;

  @Field()
  schedule2ReferenceCode: string;
}

@InputType()
export class SiteProfilesInputDTO extends ChangeAuditEntityDTO {
  @Field()
  id: string;

  @Field({ nullable: true })
  siteId?: string | null;

  @Field()
  dateCompleted: Date;

  @Field({ nullable: true })
  rwmDateDecision: Date | null;

  @Field({ nullable: true })
  localAuthDateRecd: Date | null;

  @Field({ nullable: true })
  siteRegDateRecd: Date | null;

  @Field({ nullable: true })
  siteRegDateEntered: Date | null;

  @Field({ nullable: true })
  localAuthDateSubmitted: Date | null;

  @Field({ nullable: true })
  localAuthDateForwarded: Date | null;

  @Field({ nullable: true })
  rwmDateReceived: Date | null;

  @Field({ nullable: true })
  rwmParticId: string | null;

  @Field({ nullable: true })
  plannedActivityComment: string | null;

  @Field({ nullable: true })
  siteDisclosureComment: string | null;

  @Field({ nullable: true })
  govDocumentsComment: string | null;

  @Field({ nullable: true })
  whenCreated: Date | null;

  @Field({ nullable: true })
  whenUpdated: Date | null;

  @Field(() => [SiteProfileSchedule2RefInputDTO], { nullable: true })
  siteProfileSchedule2Refs: SiteProfileSchedule2RefInputDTO[] | null;
}

// Input DTO — keeps the original field names the frontend sends.
// Backed by SiteProfileLandUses table; schedule2ReferenceCode maps to lutCode.
@InputType()
export class SiteProfileSchedule2RefInputDTO extends ChangeAuditEntityDTO {
  @Field({ nullable: true})
  id?: string;

  @Field({ nullable: true })
  schedule2ReferenceCode?: string;
}
