import { Field, ObjectType } from "@nestjs/graphql";
import { Sites } from "../entities/sites.entity";
import { EventPartics } from "../entities/eventPartics.entity";
import { SiteParticRoles } from "../entities/siteParticRoles.entity";
import { SitePartics } from "../entities/sitePartics.entity";
import { SiteDocs } from "../entities/siteDocs.entity";
import { SiteAssocs } from "../entities/siteAssocs.entity";
import { LandHistories } from "../entities/landHistories.entity";
import { SiteSubdivisions } from "../entities/siteSubdivisions.entity";
import { SiteProfiles } from "../entities/siteProfiles.entity";
import { isNullableType } from "graphql";
import { Events} from '../entities/events.entity';


@ObjectType()
export class SnapshotSiteContent
{
  @Field(()=>Sites)
  sitesSummary: Sites;
  @Field(()=>[Events])
  events: Events[];
  @Field(()=>[EventPartics])
  eventsParticipants: EventPartics[];
  @Field(()=>[SitePartics]) 
  siteParticipants: SitePartics[];               
  @Field(()=>[SiteDocs])
  documents: SiteDocs[];
  @Field(()=>[SiteAssocs])
  siteAssociations: SiteAssocs[];
  @Field(()=>[LandHistories])                                                                              
  landHistories: LandHistories[];
  @Field(()=>[SiteSubdivisions])
  subDivisions: SiteSubdivisions[];
  @Field(()=>[SiteProfiles])
  profiles: SiteProfiles[];
}                                        