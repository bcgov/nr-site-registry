import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteService } from './services/site/site.service';
import { SiteController } from './controllers/site.controller';
import { Sites } from './entities/sites.entity';
import { Events } from './entities/events.entity';
import { LandHistories } from './entities/landHistories.entity';
import { Mailout } from './entities/mailout.entity';
import { SiteAssocs } from './entities/siteAssocs.entity';
import { SiteDocs } from './entities/siteDocs.entity';
import { SitePartics } from './entities/sitePartics.entity';
import { SiteProfiles } from './entities/siteProfiles.entity';
import { SiteSubdivisions } from './entities/siteSubdivisions.entity';
import { BceRegionCd } from './entities/bceRegionCd.entity';
import { ClassificationCd } from './entities/classificationCd.entity';
import { SiteRiskCd } from './entities/siteRiskCd.entity';
import { SiteStatusCd } from './entities/siteStatusCd.entity';
import { EventTypeCd } from './entities/eventTypeCd.entity';
import { EventClassCd } from './entities/eventClassCd.entity';
import { ConditionsText } from './entities/conditionsText.entity';
import { EventPartics } from './entities/eventPartics.entity';
import { LandUseCd } from './entities/landUseCd.entity';
import { SiteProfileLandUses } from './entities/siteProfileLandUses.entity';
import { ProfileAnswers } from './entities/profileAnswers.entity';
import { ProfileSubmissions } from './entities/profileSubmissions.entity';
import { SiteProfileOwners } from './entities/siteProfileOwners.entity';
import { ProfileQuestions } from './entities/profileQuestions.entity';
import { ProfileCategories } from './entities/profileCategories.entity';
import { SubmissionCd } from './entities/submissionCd.entity';
import { SiteDocPartics } from './entities/siteDocPartics.entity';
import { PeopleOrgs } from './entities/peopleOrgs.entity';
import { SiteParticRoles } from './entities/siteParticRoles.entity';
import { ParticRoleCd } from './entities/particRoleCd.entity';
import { EventParticRoleCd } from './entities/eventParticRoleCd.entity';
import { CityRegions } from './entities/cityRegions.entity';
import { SiteContaminationClassXref } from './entities/siteContaminationClassXref.entity';
import { ContaminationClassCd } from './entities/contaminationClassCd.entity';
import { SiteCrownLandStatusCd } from './entities/siteCrownLandStatusCd.entity';
import { SisAddresses } from './entities/sisAddresses.entity';
import { SiteStaffs } from './entities/siteStaffs.entity';
import { DocParticRoleCd } from './entities/docParticRoleCd.entity';
import { LtoDownload } from './entities/ltoDownload.entity';
import { LtoPrevDownload } from './entities/ltoPrevDownload.entity';
import { PlanTable } from './entities/planTable.entity';
import { SiteCrownLandContaminated } from './entities/siteCrownLandContaminated.entity';
import { RecentViews } from './entities/recentViews.entity';
import { DashboardResolver } from './resolvers/dashboard/dashboard.resolver';
import { DashboardService } from './services/dashboard/dashboard.service';
import { SiteResolver } from './resolvers/site/site.resolver';
import { Snapshots } from './entities/snapshots.entity';
import { SnapshotsResolver } from './resolvers/snapshot/snapshot.resolver';
import { SnapshotsService } from './services/snapshot/snapshot.service';
import { ParticipantResolver } from './resolvers/participant/participant.resolver';
import { ParticipantService } from './services/participant/participant.service';
import { GenericResponseProvider } from './dto/response/genericResponseProvider';
import { DropdownResolver } from './resolvers/dropdown/dropdown.resolver';
import { DropdownService } from './services/dropdown/dropdown.service';
import { DisclosureService } from './services/disclosure/disclosure.service';
import { DisclosureResolver } from './resolvers/disclosure/disclosure.resolver';
import { CartResolver } from './resolvers/cart/cart.resolver';
import { CartService } from './services/cart/cart.service';
import { Cart } from './entities/cart.entity';
import { NotationResolver } from './resolvers/notation/notation.resolver';
import { NotationService } from './services/notation/notation.service';

/**
 * Module for wrapping all functionalities in sites microserivce
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sites,
      Events,
      LandHistories,
      Mailout,
      SiteAssocs,
      SiteDocs,
      SitePartics,
      SiteProfiles,
      SiteSubdivisions,
      BceRegionCd,
      ClassificationCd,
      SiteRiskCd,
      SiteStatusCd,
      EventTypeCd,
      EventClassCd,
      SiteStatusCd,
      Events,
      ConditionsText,
      EventPartics,
      EventTypeCd,
      LandUseCd,
      LandHistories,
      SiteProfileLandUses,
      ProfileAnswers,
      ProfileSubmissions,
      SiteProfileLandUses,
      SiteProfileOwners,
      ProfileQuestions,
      ProfileCategories,
      SubmissionCd,
      SiteDocPartics,
      PeopleOrgs,
      SiteParticRoles,
      ParticRoleCd,
      EventParticRoleCd,
      CityRegions,
      SiteContaminationClassXref,
      ContaminationClassCd,
      SiteCrownLandStatusCd,
      SisAddresses,
      SiteStaffs,
      DocParticRoleCd,
      LtoDownload,
      LtoPrevDownload,
      PlanTable,
      SiteCrownLandContaminated,
      RecentViews,
      Snapshots,
      Cart,
    ]),
  ],
  providers: [
    SiteResolver,
    SiteService,
    DashboardResolver,
    DashboardService,
    SnapshotsResolver,
    SnapshotsService,
    ParticipantResolver,
    ParticipantService,
    DropdownResolver,
    DropdownService,
    DisclosureResolver,
    DisclosureService,
    GenericResponseProvider,
    CartResolver,
    CartService,
    NotationResolver,
    NotationService
  ],
  controllers: [SiteController],
})
export class SiteModule {}
