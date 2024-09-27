import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folio } from '../../entities/folio.entity';
import { Repository } from 'typeorm';
import { FolioDTO, FolioMinDTO } from '../../dto/folio.dto';
import { plainToInstance } from 'class-transformer';
import { FolioContentsService } from './folioContents.service';
import { FolioContentDTO } from '../../dto/folioContent.dto';
import { FolioContents } from '../../entities/folioContents.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class FolioService {
  constructor(
    @InjectRepository(Folio)
    private folioRepository: Repository<Folio>,

    private folioContentService: FolioContentsService,
  ) {}

  async getFoliosForUser(userInfo: any): Promise<Folio[]> {
    sitesLogger.info('FolioService.getFoliosForUser() start');
    sitesLogger.debug('FolioService.getFoliosForUser() start');
    try {
      const userId = userInfo.sub;
      const folio = await this.folioRepository.find({
        relations: { folioContents: true },
        where: { userId },
        order: { id: 'ASC' },
      });
      sitesLogger.info('FolioService.getFoliosForUser() end');
      sitesLogger.debug('FolioService.getFoliosForUser() end');
      return folio;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioService.getFoliosForUser() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async getSitesForFolio(
    input: FolioMinDTO,
    userInfo: any,
  ): Promise<FolioContents[] | null> {
    sitesLogger.info('FolioService.getSitesForFolio() start');
    sitesLogger.debug('FolioService.getSitesForFolio() start');
    try {
      const userId = userInfo.sub;
      const { id } = input;
      const folio = await this.folioRepository.findOne({
        where: { id, userId },
      });

      if (folio) {
        sitesLogger.info('FolioService.getSitesForFolio() end');
        sitesLogger.debug('FolioService.getSitesForFolio() end');
        return this.folioContentService.getSiteForFolio(folio.id.toString());
      } else {
        sitesLogger.info('FolioService.getSitesForFolio() end');
        sitesLogger.debug('FolioService.getSitesForFolio() end');
        return null;
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioService.getSitesForFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async addFolio(inputDTO: FolioDTO, userInfo: any): Promise<boolean> {
    sitesLogger.info('FolioService.addFolio() start');
    sitesLogger.debug('FolioService.addFolio() start');
    try {
      const { folioId } = inputDTO;

      const userId = userInfo.sub;

      const existingRecord = await this.folioRepository.findOne({
        where: { userId, folioId },
      });

      if (!existingRecord) {
        const folio = plainToInstance(Folio, inputDTO);
        folio.whenCreated = new Date();
        folio.whenUpdated = new Date();
        const result = await this.folioRepository.save(folio);

        if (result) {
          sitesLogger.info('FolioService.addFolio() end');
          sitesLogger.debug('FolioService.addFolio() end');
          return true;
        } else {
          sitesLogger.info('FolioService.addFolio() end');
          sitesLogger.debug('FolioService.addFolio() end');
          return false;
        }
      }
      sitesLogger.info('FolioService.addFolio() end');
      sitesLogger.debug('FolioService.addFolio() end');
      return false;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioService.addFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async updateFolio(inputArr: FolioDTO[], userInfo: any): Promise<boolean> {
    sitesLogger.info('FolioService.updateFolio() start');
    sitesLogger.debug('FolioService.updateFolio() start');
    try {
      const userId = userInfo.sub;
      const updatePromises = inputArr.map(async (inputDTO) => {
        const { id, description, folioId } = inputDTO;

        const existingRecord = await this.folioRepository.findOne({
          where: { id, userId },
        });

        if (existingRecord) {
          existingRecord.description = description;
          existingRecord.folioId = folioId;
          existingRecord.whenUpdated = new Date();

          const result = await this.folioRepository.save(existingRecord);

          if (!result) {
            sitesLogger.error(`Failed to save record with id ${id}`);
          }
        } else {
          sitesLogger.error(`Unable to find existing record for ${id} `);
        }
      });
      sitesLogger.info('FolioService.updateFolio() end');
      sitesLogger.debug('FolioService.updateFolio() end');
      await Promise.all(updatePromises);
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioService.updateFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }

    return true;
  }

  async deleteFolio(id: number, userInfo: any): Promise<boolean> {
    sitesLogger.info('FolioService.deleteFolio() start');
    sitesLogger.debug('FolioService.deleteFolio() start');
    try {
      if (id <= 0) {
        return false;
      }

      const userId = userInfo.sub;

      const savedFolio = this.folioRepository.findOne({
        where: { id, userId },
      });

      if (savedFolio != null) {
        await this.folioContentService.deleteAllSitesInFolio(id.toString());
        const result = await this.folioRepository.delete({ id });
        sitesLogger.info('FolioService.deleteFolio() end');
        sitesLogger.debug('FolioService.deleteFolio() end');
        return result.affected > 0;
      } else {
        sitesLogger.error(`unable to find saved folio for ${id}`);
      }

      sitesLogger.info('FolioService.deleteFolio() end');
      sitesLogger.debug('FolioService.deleteFolio() end');
      return false;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioService.deleteFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async addSiteToFolio(
    inputDTO: [FolioContentDTO],
    userInfo: any,
  ): Promise<boolean> {
    sitesLogger.info('FolioService.addSiteToFolio() start');
    sitesLogger.debug('FolioService.addSiteToFolio() start');
    try {
      if (inputDTO.length > 0) {
        inputDTO.forEach((item) => {
          if (item != null) {
            const userId = userInfo.sub;
            const { id } = item;
            this.folioRepository
              .findOne({ where: { id, userId } })
              .then((folio) => {
                if (folio) {
                  item.folioId = folio.id.toString();
                  this.folioContentService.addFolioContent(item);
                }
              });
          }
        });
      }

      sitesLogger.info('FolioService.addSiteToFolio() end');
      sitesLogger.debug('FolioService.addSiteToFolio() end');
      return true;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioService.addSiteToFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async deleteSitesInFolio(
    inputDTO: [FolioContentDTO],
    userInfo: any,
  ): Promise<boolean> {
    sitesLogger.info('FolioService.deleteSitesInFolio() start');
    sitesLogger.debug('FolioService.deleteSitesInFolio() start');
    try {
      if (inputDTO.length > 0) {
        inputDTO.forEach((item) => {
          if (item != null) {
            const userId = userInfo.sub;
            const { id } = item;
            this.folioRepository
              .findOne({ where: { id, userId } })
              .then((folio) => {
                if (folio) {
                  item.folioId = folio.id.toString();
                  this.folioContentService.deleteSitesInFolio(
                    item.folioId,
                    item.siteId,
                  );
                }
              });
          }
        });
      }
      sitesLogger.info('FolioService.deleteSitesInFolio() end');
      sitesLogger.debug('FolioService.deleteSitesInFolio() end');
      return true;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioService.deleteSitesInFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }
}
