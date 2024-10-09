import { Field, InputType } from '@nestjs/graphql';
import { NotationIputDTO, NotationParticipantInputDTO } from './notation.dto';
import { SiteParticsInputDto } from './sitePartics.dto';
import { DocumentInputDTO } from './document.dto';
import { SiteSummaryDTO } from './siteSummary.dto';
import { SubDivisionsInputDTO } from './subDivisionsInput.dto';
import { LandHistoriesInputDTO } from './landHistoriesInput.dto';
import { SiteAssociationsInputDTO } from './associatedSite.dto';
import { SiteProfilesInputDTO } from './disclosure.dto';

@InputType()
export class SaveSiteDetailsDTO {
  @Field(() => SiteSummaryDTO, { nullable: true })
  sitesSummary?: SiteSummaryDTO;

  @Field(() => [NotationIputDTO], { nullable: true })
  events?: NotationIputDTO[];

  @Field(() => [NotationParticipantInputDTO], { nullable: true })
  eventsParticipants?: NotationParticipantInputDTO[];

  @Field(() => [SiteParticsInputDto], { nullable: true })
  siteParticipants?: SiteParticsInputDto[];

  @Field(() => [DocumentInputDTO], { nullable: true })
  documents?: DocumentInputDTO[];

  @Field(() => [SiteAssociationsInputDTO], { nullable: true })
  siteAssociations?: SiteAssociationsInputDTO[];

  @Field(() => [SubDivisionsInputDTO], { nullable: true })
  subDivisions?: SubDivisionsInputDTO[];

  @Field(() => [LandHistoriesInputDTO], { nullable: true })
  landHistories?: LandHistoriesInputDTO[];

  @Field(() => [SiteProfilesInputDTO], { nullable: true })
  profiles?: SiteProfilesInputDTO[];

  @Field(() => String)
  siteId: string;
}
