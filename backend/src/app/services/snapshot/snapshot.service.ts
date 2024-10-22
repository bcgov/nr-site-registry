import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSnapshotDto } from '../../dto/snapshot.dto';
import { Snapshots } from '../../entities/snapshots.entity';
import { Repository } from 'typeorm';
import { Sites } from '../../entities/sites.entity';
import { EventPartics } from '../../entities/eventPartics.entity';
import { SitePartics } from '../../entities/sitePartics.entity';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { LandHistories } from '../../entities/landHistories.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { SnapshotSiteContent } from '../../dto/snapshotSiteContent';
import { Events } from '../../entities/events.entity';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectRepository(Snapshots)
    private snapshotRepository: Repository<Snapshots>,
    @InjectRepository(Sites)
    private sitesRespository: Repository<Sites>,
    @InjectRepository(Events)
    private eventsRepositoryRepo: Repository<Events>,
    @InjectRepository(EventPartics)
    private eventsParticipantsRepo: Repository<EventPartics>,
    @InjectRepository(SitePartics)
    private siteParticipantsRepo: Repository<SitePartics>,
    @InjectRepository(SiteDocs)
    private siteDocumentsRepo: Repository<SiteDocs>,
    @InjectRepository(SiteAssocs)
    private siteAssociationsRepo: Repository<SiteAssocs>,
    @InjectRepository(LandHistories)
    private landHistoriesRepo: Repository<LandHistories>,
    @InjectRepository(SiteSubdivisions)
    private siteSubDivisionsRepo: Repository<SiteSubdivisions>,
    @InjectRepository(SiteProfiles)
    private siteProfilesRepo: Repository<SiteProfiles>,
    private readonly sitesLogger: LoggerService,
  ) {}

  async getSnapshots() {
    this.sitesLogger.log('SnapshotsService.getSnapshots() start');
    this.sitesLogger.debug('SnapshotsService.getSnapshots() start');
    try {
      const result = await this.snapshotRepository.find();
      this.sitesLogger.log('SnapshotsService.getSnapshots() end');
      this.sitesLogger.debug('SnapshotsService.getSnapshots() end');
      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshots() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve snapshots.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getSnapshotsByUserId(userId: string) {
    this.sitesLogger.log('SnapshotsService.getSnapshotsByUserId() start');
    this.sitesLogger.debug('SnapshotsService.getSnapshotsByUserId() start');
    try {
      const result = await this.snapshotRepository.find({
        where: { userId },
        order: { whenCreated: 'DESC' },
      });
      this.sitesLogger.log('SnapshotsService.getSnapshotsByUserId() end');
      this.sitesLogger.debug('SnapshotsService.getSnapshotsByUserId() end');
      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshotsByUserId() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve snapshots by userId: ${userId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getSnapshotsBySiteId(siteId: string, userId: string) {
    this.sitesLogger.log('SnapshotsService.getSnapshotsBySiteId() start');
    this.sitesLogger.debug('SnapshotsService.getSnapshotsBySiteId() start');
    try {
      const result = await this.snapshotRepository.find({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
      });
      this.sitesLogger.log('SnapshotsService.getSnapshotsBySiteId() end');
      this.sitesLogger.debug('SnapshotsService.getSnapshotsBySiteId() end');
      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshotsBySiteId() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve snapshots by userId: ${userId} and siteId: ${siteId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getMostRecentSnapshot(siteId: string, userId: string) {
    this.sitesLogger.log('SnapshotsService.getMostRecentSnapshot() start');
    this.sitesLogger.debug('SnapshotsService.getMostRecentSnapshot() start');
    try {
      const result = await this.snapshotRepository.findOne({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
      });

      this.sitesLogger.log('SnapshotsService.getMostRecentSnapshot() end');
      this.sitesLogger.debug('SnapshotsService.getMostRecentSnapshot() end');
      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SnapshotsService.getMostRecentSnapshot() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve the most recent snapshot.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getSnapshotsById(id: number) {
    this.sitesLogger.log('SnapshotsService.getSnapshotsById() start');
    this.sitesLogger.debug('SnapshotsService.getSnapshotsById() start');
    try {
      const result = await this.snapshotRepository.find({ where: { id } });
      this.sitesLogger.log('SnapshotsService.getSnapshotsById() end');
      this.sitesLogger.debug('SnapshotsService.getSnapshotsById() end');
      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshotsById() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve snapshot by ID: ${id}.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async createSnapshotForSites(
    inputDto: CreateSnapshotDto[],
    userInfo: any,
  ): Promise<boolean> {
    this.sitesLogger.log('SnapshotsService.createSnapshotForSites() start');
    this.sitesLogger.debug('SnapshotsService.createSnapshotForSites() start');
    try {
      const snapShotsToBeSaved = [];

      const createSnapShotContent = inputDto.map(async (dto) => {
        if (dto) {
          const { siteId } = dto;
          if (siteId !== '') {
            const snapShotContent: SnapshotSiteContent =
              new SnapshotSiteContent();

            snapShotContent.sitesSummary = await this.sitesRespository.findOne({
              where: { id: siteId },
            });

            snapShotContent.events = await this.eventsRepositoryRepo.find({
              where: { siteId },
            });

            const fetchEventParticipants = snapShotContent.events.map(
              async (event) => {
                snapShotContent.eventsParticipants =
                  await this.eventsParticipantsRepo.find({
                    where: { eventId: event.id },
                  });
              },
            );

            snapShotContent.siteParticipants =
              await this.siteParticipantsRepo.find({ where: { siteId } });

            snapShotContent.documents = await this.siteDocumentsRepo.find({
              where: { siteId },
            });

            snapShotContent.landHistories = await this.landHistoriesRepo.find({
              where: { siteId },
            });

            snapShotContent.profiles = await this.siteProfilesRepo.find({
              where: { siteId },
            });

            snapShotContent.subDivisions = await this.siteSubDivisionsRepo.find(
              { where: { siteId } },
            );

            const newSnapshot = {
              userId: userInfo.sub,
              siteId: siteId,
              transactionId: new Date().getTime().toString(),
              snapshotData: snapShotContent,
              whenCreated: new Date(),
              whoCreated: userInfo.givenName,
            };

            snapShotsToBeSaved.push(newSnapshot);

            await Promise.all(fetchEventParticipants);
          } else {
            console.log('Site id is empty');
          }
        } else {
          console.log('At createSnapshotForUser dto is null');
        }
      });

      await Promise.all(createSnapShotContent);

      const saveResult = await this.snapshotRepository.save(snapShotsToBeSaved);

      if (saveResult.length > 0) {
        this.sitesLogger.log('SnapshotsService.createSnapshotForSites() end');
        this.sitesLogger.debug('SnapshotsService.createSnapshotForSites() end');
        return true;
      } else {
        this.sitesLogger.log('SnapshotsService.createSnapshotForSites() end');
        this.sitesLogger.debug('SnapshotsService.createSnapshotForSites() end');
        return false;
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SnapshotsService.createSnapshotForSites() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to create snapshot.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getBannerType(siteId: string, userId: string): Promise<string> {
    try {
      const query = `
          WITH Combined AS (
            SELECT id as site_id, sr_action, when_updated FROM sites.sites
            WHERE id = $1 AND sr_action <> 'private'
            UNION ALL
            SELECT site_id, sr_action, when_updated FROM sites.events
            WHERE site_id = $1  AND sr_action <> 'private'
            UNION ALL
            SELECT e.site_id, ep.sr_action, ep.when_updated FROM sites.event_partics ep
            INNER JOIN sites.events e ON ep.event_id = e.id
            WHERE e.site_id = $1 AND ep.sr_action <> 'private'
            UNION ALL
            SELECT site_id, sr_action, when_updated FROM sites.site_partics
            WHERE site_id = $1 AND sr_action <> 'private'
            UNION ALL
            SELECT site_id, sr_action, when_updated FROM sites.site_docs
            WHERE site_id = $1 AND sr_action <> 'private'
            UNION ALL
            SELECT site_id, sr_action, when_updated FROM sites.site_assocs
            WHERE site_id = $1 AND sr_action <> 'private'
            UNION ALL
            SELECT site_id, sr_action, when_updated FROM sites.land_histories
            WHERE site_id = $1 AND sr_action <> 'private'
            UNION ALL
            SELECT site_id, sr_action, when_updated FROM sites.site_subdivisions
            WHERE site_id = $1 AND sr_action <> 'private'
            UNION ALL
            SELECT site_id, sr_action, when_updated FROM sites.site_profiles
            WHERE site_id = $1 AND sr_action <> 'private'
          ),
          PendingCheck AS (
            SELECT 'pending' AS bannertype
            FROM Combined
            WHERE sr_action = 'pending' AND site_id = $1
            LIMIT 1
          ),
          LatestSnapshot AS (
            SELECT s.site_id, s.user_id, MAX(s.when_created) AS latest_created_date
            FROM sites.snapshots s
            WHERE s.site_id = $1 AND s.user_id = $2
            GROUP BY s.site_id, s.user_id
          ),
          StatusCheck AS (
            SELECT
              COALESCE(MAX(CASE
                WHEN c.sr_action = 'public' AND c.when_updated > ls.latest_created_date THEN 'outdated'
                ELSE 'current'
              END), 'current') AS bannertype
            FROM Combined c
            RIGHT JOIN LatestSnapshot ls ON c.site_id = ls.site_id
            WHERE NOT EXISTS (SELECT 1 FROM PendingCheck)
            GROUP BY c.site_id
          )
          SELECT bannertype FROM PendingCheck
          UNION ALL
          SELECT DISTINCT bannertype FROM StatusCheck
          LIMIT 1;
        `;

      const entityManager = this.snapshotRepository.manager;
      const result = await entityManager.query(query, [siteId, userId]);
      return result.length > 0 ? result[0].bannertype : 'unknown';
    } catch (error) {
      throw new HttpException(
        `Failed to determine banner type.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
