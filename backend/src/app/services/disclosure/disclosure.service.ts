import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { LoggerService } from '../../logger/logger.service';
import { UserActionEnum } from '../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { plainToInstance } from 'class-transformer';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { UserTypeEum } from '../../common/userType';
import { SiteProfilesDTO } from '../../dto/disclosure.dto';

@Injectable()
export class DisclosureService {
  constructor(
    @InjectRepository(SiteProfiles)
    private readonly disclosureRepository: Repository<SiteProfiles>,
    private readonly sitesLogger: LoggerService,
    private snapshotService: SnapshotsService,
  ) {}

  /**
   * Retrieves site profiles for a given site ID.
   *
   * @param siteId - The ID of the site whose profiles are to be fetched.
   * @returns A promise that resolves to an array of SiteProfiles entities.
   * @throws Error if there is an issue retrieving the data.
   */
  async getSiteDisclosureBySiteId(
    siteId: string,
    showPending: boolean,
    user: any,
  ) {
    try {
      this.sitesLogger.log(
        'DisclosureService.getSiteDisclosureBySiteId() start',
      );
      // Fetch site profiles based on the provided siteId
      let result: SiteProfiles[] = [];
      if (user?.identity_provider === UserTypeEum.IDIR) {
        result = await this.disclosureRepository.find({
          where: { siteId },
          relations: ['siteProfileLandUses'],
        });

        if (showPending) {
          result = result.filter(
            (profile) =>
              profile.srAction === SRApprovalStatusEnum.PENDING ||
              profile.siteProfileLandUses?.some(
                (ref) => ref.srAction === SRApprovalStatusEnum.PENDING,
              ),
          );
        }
      } else {
        const userId: string = user?.sub ? user.sub : '';
        if (userId?.length === 0) {
          this.sitesLogger.log(
            'An invalid user was passed into DisclosureService.getSiteDisclosureBySiteId() end',
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
            result = snapshot?.snapshotData?.profiles;
          }
        }
      }

      if (!result?.length) {
        return [];
      } else {
        const res = result?.map((res) => {
          return {
            ...res,
            srAction: res.srAction === SRApprovalStatusEnum.PUBLIC,
            siteProfileSchedule2Refs: res?.siteProfileLandUses?.map(
              (ref) => {
                return {
                  ...ref,
                  // id format: "<siteId>-<lutCode>" — parsed in processSchedule2Refs to recover oldLutCode on UPDATE
                  id: res.siteId + '-' + ref.lutCode,
                  schedule2ReferenceCode: ref.lutCode,
                  userAction: ref.userAction ?? UserActionEnum.DEFAULT,
                  srValue: ref.srAction === SRApprovalStatusEnum.PUBLIC,
                  srAction: ref.srAction,
                };
              },
            ),
          };
        });
        this.sitesLogger.log(
          'DisclosureService.getSiteDisclosureBySiteId() end',
        );
        // Convert the transformed objects into DTOs
        const disclosure = plainToInstance(SiteProfilesDTO, res);
        return disclosure;
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DisclosureService.getSiteDisclosureBySiteId() end',
        JSON.stringify(error),
      );
      // Log or handle the error as necessary
      throw new HttpException(
        `Failed to retrieve site disclosures for siteId ${siteId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
