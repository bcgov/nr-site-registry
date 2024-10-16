import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { Subdivisions } from './entities/subdivisions.entity';
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
import { LandHistoryResolver } from './resolvers/landHistory/landHistory.resolver';
import { LandHistoryService } from './services/landHistory/landHistory.service';
import { NotationResolver } from './resolvers/notation/notation.resolver';
import { NotationService } from './services/notation/notation.service';
import { DocumentResolver } from './resolvers/document/document.resolver';
import { DocumentService } from './services/document/document.service';
import { Folio } from './entities/folio.entity';
import { FolioContents } from './entities/folioContents.entity';
import { FolioResolver } from './resolvers/folio/folio.resolver';
import { FolioService } from './services/folio/folio.service';
import { FolioContentsService } from './services/folio/folioContents.service';
import { UserJWTTokenDecoderMiddleware } from './middleware/userJwtTokenDecoder';
import { UserService } from './services/user/user.service';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AssociatedSiteResolver } from './resolvers/associatedSite/associatedSite.resolver';
import { AssociatedSiteService } from './services/associatedSite/associatedSite.service';
import { LandUseCodeResolver } from './resolvers/landUseCode/landUseCode.resolver';
import { LandUseCodeService } from './services/landUseCode/landUseCode.service';
import { HistoryLog } from './entities/siteHistoryLog.entity';
import { ParcelDescriptionResolver } from './resolvers/parcelDescription/parcelDescription.resolver';
import { ParcelDescriptionsService } from './services/parcelDescriptions/parcelDescriptions.service';
import { TransactionManagerService } from './services/transactionManager/transactionManager.service';
import { LoggerService } from './logger/logger.service';

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
      Subdivisions,
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
      Folio,
      FolioContents,
      User,
      HistoryLog,
    ]),
  ],
  providers: [
    SiteResolver,
    SiteService,
    DashboardResolver,
    DashboardService,
    SnapshotsResolver,
    SnapshotsService,
    ParcelDescriptionResolver,
    ParcelDescriptionsService,
    ParticipantResolver,
    ParticipantService,
    DropdownResolver,
    DropdownService,
    DisclosureResolver,
    DisclosureService,
    GenericResponseProvider,
    CartResolver,
    CartService,
    LandHistoryResolver,
    LandHistoryService,
    LandUseCodeResolver,
    LandUseCodeService,
    NotationResolver,
    NotationService,
    DocumentResolver,
    DocumentService,
    FolioResolver,
    FolioService,
    FolioContentsService,
    UserService,
    JwtService,
    AssociatedSiteResolver,
    AssociatedSiteService,
    TransactionManagerService,
    LoggerService,
  ],
  controllers: [SiteController],
})
export class SiteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserJWTTokenDecoderMiddleware).forRoutes('*'); // Apply to all routes or specific routes
  }
}
