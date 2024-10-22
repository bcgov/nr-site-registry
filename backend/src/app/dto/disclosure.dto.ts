import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { SiteProfiles } from '../entities/siteProfiles.entity';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@ObjectType()
export class DisclosureResponse extends ResponseDto {
  @Field(() => [SiteProfiles], { nullable: true })
  data: SiteProfiles[] | null;
}

@InputType()
export class SiteProfilesInputDTO extends ChangeAuditEntityDTO {
  @Field()
  id: string;

  @Field()
  siteId: string;

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
}
