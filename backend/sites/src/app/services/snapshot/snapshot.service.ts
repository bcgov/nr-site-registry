import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { CreateSnapshotDto, SnapshotDto } from '../../dto/snapshot.dto';
import { Snapshots } from '../../entities/snapshots.entity';
import { Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Sites } from 'src/app/entities/sites.entity';
import { EventPartics } from 'src/app/entities/eventPartics.entity';
import { SitePartics } from 'src/app/entities/sitePartics.entity';
import { SiteDocs } from 'src/app/entities/siteDocs.entity';
import { SiteAssocs } from 'src/app/entities/siteAssocs.entity';
import { LandHistories } from 'src/app/entities/landHistories.entity';
import { SiteSubdivisions } from 'src/app/entities/siteSubdivisions.entity';
import { SiteProfiles } from 'src/app/entities/siteProfiles.entity';
import { SnapshotSiteContent } from 'src/app/dto/snapshotSiteContent';
import { Events } from '../../entities/events.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

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
  ) {}

  async getSnapshots() {
    sitesLogger.info('SnapshotsService.getSnapshots() start');
    sitesLogger.debug('SnapshotsService.getSnapshots() start');
    try {
      const result = await this.snapshotRepository.find();
      sitesLogger.info('SnapshotsService.getSnapshots() end');
      sitesLogger.debug('SnapshotsService.getSnapshots() end');
      return result;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshots() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve snapshots.');
    }
  }

  async getSnapshotsByUserId(userId: string) {
    sitesLogger.info('SnapshotsService.getSnapshotsByUserId() start');
    sitesLogger.debug('SnapshotsService.getSnapshotsByUserId() start');
    try {
      const result = await this.snapshotRepository.find({
        where: { userId },
        order: { whenCreated: 'DESC' },
      });
      sitesLogger.info('SnapshotsService.getSnapshotsByUserId() end');
      sitesLogger.debug('SnapshotsService.getSnapshotsByUserId() end');
      return result;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshotsByUserId() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve snapshots by userId.');
    }
  }

  async getSnapshotsBySiteId(siteId: string, userId: string) {
    sitesLogger.info('SnapshotsService.getSnapshotsBySiteId() start');
    sitesLogger.debug('SnapshotsService.getSnapshotsBySiteId() start');
    try {
      const result = await this.snapshotRepository.find({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
      });
      sitesLogger.info('SnapshotsService.getSnapshotsBySiteId() end');
      sitesLogger.debug('SnapshotsService.getSnapshotsBySiteId() end');
      return result;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshotsBySiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve snapshots by userId and siteId.');
    }
  }

  async getSnapshotsById(id: number) {
    sitesLogger.info('SnapshotsService.getSnapshotsById() start');
    sitesLogger.debug('SnapshotsService.getSnapshotsById() start');
    try {
      const result = await this.snapshotRepository.find({ where: { id } });
      sitesLogger.info('SnapshotsService.getSnapshotsById() end');
      sitesLogger.debug('SnapshotsService.getSnapshotsById() end');
      return result;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in SnapshotsService.getSnapshotsById() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async createSnapshot(snapshotDto: SnapshotDto) {
    sitesLogger.info('SnapshotsService.createSnapshot() start');
    sitesLogger.debug('SnapshotsService.createSnapshot() start');
    try {
      await validateOrReject(snapshotDto);
      const snapshot = plainToInstance(Snapshots, snapshotDto);
      const result = await this.snapshotRepository.save(snapshot);
      if (result) {
        sitesLogger.info('SnapshotsService.createSnapshot() end');
        sitesLogger.debug('SnapshotsService.createSnapshot() end');
        return 'Record is inserted successfully.';
      }
      sitesLogger.info('SnapshotsService.createSnapshot() end');
      sitesLogger.debug('SnapshotsService.createSnapshot() end');
    } catch (error) {
      sitesLogger.error(
        'Exception occured in SnapshotsService.createSnapshot() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to insert snapshot.');
    }
  }

  async createSnapshotForSites(
    inputDto: CreateSnapshotDto[],
    userInfo: any,
  ): Promise<boolean> {
    sitesLogger.info('SnapshotsService.createSnapshotForSites() start');
    sitesLogger.debug('SnapshotsService.createSnapshotForSites() start');
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
        sitesLogger.info('SnapshotsService.createSnapshotForSites() end');
        sitesLogger.debug('SnapshotsService.createSnapshotForSites() end');
        return true;
      } else {
        sitesLogger.info('SnapshotsService.createSnapshotForSites() end');
        sitesLogger.debug('SnapshotsService.createSnapshotForSites() end');
        return false;
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in SnapshotsService.createSnapshotForSites() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }
}
