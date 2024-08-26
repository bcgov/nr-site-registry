import { Injectable } from '@nestjs/common';
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
    try {
      const result = await this.snapshotRepository.find();
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve snapshots.');
    }
  }

  async getSnapshotsByUserId(userId: string) {
    try {
      const result = await this.snapshotRepository.find({
        where: { userId },
        order: { whenCreated: 'DESC' },
      });
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve snapshots by userId.');
    }
  }

  async getSnapshotsBySiteId(siteId: string, userId: string) {
    try {
      const result = await this.snapshotRepository.find({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
      });
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve snapshots by userId and siteId.');
    }
  }

  async getSnapshotsById(id: number) {
    try {
      const result = await this.snapshotRepository.find({ where: { id } });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createSnapshotForSites(
    inputDto: CreateSnapshotDto[],
    userInfo: any,
  ): Promise<boolean> {
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
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log('Failed To Create Snapshot', error);
      throw error;
    }
  }
}
