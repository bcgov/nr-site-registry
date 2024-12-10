import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { AssociatedSiteDto } from '../../dto/associatedSite.dto';
import { LoggerService } from '../../logger/logger.service';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';

import { UserActionEnum } from '../../common/userActionEnum';
import { UserTypeEum } from '../../common/userType';
import { SnapshotsService } from '../snapshot/snapshot.service';

@Injectable()
export class AssociatedSiteService {
  constructor(
    @InjectRepository(SiteAssocs)
    private readonly assocSiteRepository: Repository<SiteAssocs>,
    private readonly sitesLogger: LoggerService,
    private snapshotService: SnapshotsService,
  ) {}

  /**
   * Retrieves associated sites for a given site ID and transforms the data into DTOs.
   *
   * @param siteId - The ID of the site for which associated sites are to be fetched.
   * @returns An array of AssociatedSiteDto objects containing details of associated sites.
   * @throws Error if there is an issue retrieving the data.
   */
  async getAssociatedSitesBySiteId(
    siteId: string,
    showPending: boolean,
    user: any,
  ) {
    try {
      this.sitesLogger.log(
        'AssociatedSiteService.getAssociatedSitesBySiteId() start',
      );
      this.sitesLogger.debug(
        'AssociatedSiteService.getAssociatedSitesBySiteId() start',
      );

      let result: SiteAssocs[] = [];
      if (user?.identity_provider === UserTypeEum.IDIR) {
        if (showPending) {
          result = await this.assocSiteRepository.find({
            where: { siteId, srAction: SRApprovalStatusEnum.PENDING },
          });
        } else {
          result = await this.assocSiteRepository.find({ where: { siteId } });
        }
      } else {
        const userId: string = user?.sub ? user.sub : '';
        if (userId?.length === 0) {
          this.sitesLogger.log(
            'An invalid user was passed into AssociatedSiteService.getAssociatedSitesBySiteId() end',
          );
          return [];
        } else {
          const snapshot = await this.snapshotService.getMostRecentSnapshot(
            siteId,
            userId,
          );
          if (!snapshot) {
            return [];
          } else {
            result = snapshot?.snapshotData?.siteAssociations;
          }
        }
      }

      // Transform the fetched data into the desired format
      const transformedObjects = result?.map((assocs) => {
        const effectiveDate = assocs?.effectiveDate;
        const formattedEffectiveDate = effectiveDate
          ? new Date(effectiveDate) instanceof Date &&
            !isNaN(new Date(effectiveDate).getTime())
            ? new Date(effectiveDate).toISOString() // Convert to ISO string if valid
            : null // Set to null if it's not a valid date
          : null; // Handle null or undefined effectiveDate
        return {
          id: assocs?.id,
          siteId: assocs?.siteId,
          siteIdAssociatedWith: assocs?.siteIdAssociatedWith,
          effectiveDate: formattedEffectiveDate,
          note: assocs?.note ? assocs?.note.trim() : null, // Ensure note is trimmed
          srAction:
            assocs.srAction === SRApprovalStatusEnum.PUBLIC ? true : false,
        };
      });

      // Convert the transformed objects into DTOs
      const siteAssocs = plainToInstance(AssociatedSiteDto, transformedObjects);
      this.sitesLogger.log(
        'AssociatedSiteService.getAssociatedSitesBySiteId() end',
      );
      this.sitesLogger.debug(
        'AssociatedSiteService.getAssociatedSitesBySiteId() end',
      );
      return siteAssocs;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in AssociatedSiteService.getAssociatedSitesBySiteId() end',
        JSON.stringify(error),
      );

      throw new HttpException(
        `Failed to retrieve associated sites by site ID: ${siteId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
