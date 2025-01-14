import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { LoggerService } from '../../logger/logger.service';
import { UserActionEnum } from '../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { plainToInstance } from 'class-transformer';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { UserTypeEum } from '../../common/userType';
import { PeopleOrgs } from 'src/app/entities/peopleOrgs.entity';
import { SiteProfilesDTO } from 'src/app/dto/disclosure.dto';

@Injectable()
export class DisclosureService {
  constructor(
    @InjectRepository(SiteProfiles)
    private readonly disclosureRepository: Repository<SiteProfiles>,
    @InjectRepository(PeopleOrgs)
    private readonly peopleOrgRepository: Repository<PeopleOrgs>,
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
  ): Promise<SiteProfilesDTO[]> {
    try {
      this.sitesLogger.log(
        'DisclosureService.getSiteDisclosureBySiteId() start',
      );
      // Fetch site profiles based on the provided siteId
      let result: SiteProfiles[] = [];
      if (user?.identity_provider === UserTypeEum.IDIR) {
        if (showPending) {
          result = await this.disclosureRepository.find({
            where: { siteId, srAction: SRApprovalStatusEnum.PENDING },
          });
        } else {
          result = await this.disclosureRepository.find({ where: { siteId } });
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
        // Step 1: Fetch all PeopleOrgs in one query for the required ids
        const siteRegParticIds = result.map((res) => res.siteRegParticId);
        const peopleOrgs = await this.peopleOrgRepository.find({
          where: { id: In(siteRegParticIds) },
        });

        // Step 2: Create a lookup map for displayName by siteRegParticId
        const displayNameMap = peopleOrgs.reduce((map, org) => {
          map[org.id] = org.displayName;
          return map;
        }, {});

        // Step 3: Map over result and resolve displayName using the lookup map
        const res = result.map((res) => {
          return {
            ...res,
            displayName: displayNameMap[res.siteRegParticId] || '',
            srAction: res.srAction === SRApprovalStatusEnum.PUBLIC,
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
