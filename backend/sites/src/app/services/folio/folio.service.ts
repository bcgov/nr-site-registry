import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folio } from '../../entities/folio.entity';
import { Repository } from 'typeorm';
import { FolioDTO, FolioMinDTO } from '../../dto/folio.dto';
import { plainToInstance } from 'class-transformer';
import { FolioContentsService } from './folioContents.service';
import { FolioContentDTO } from '../../dto/folioContent.dto';
import { FolioContents } from '../../entities/folioContents.entity';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class FolioService {
  constructor(
    @InjectRepository(Folio)
    private folioRepository: Repository<Folio>,
    private folioContentService: FolioContentsService,
    private readonly sitesLogger: LoggerService,
  ) {}

  async getFoliosForUser(userInfo: any): Promise<Folio[]> {
    this.sitesLogger.log('FolioService.getFoliosForUser() start');
    this.sitesLogger.debug('FolioService.getFoliosForUser() start');
    try {
      const userId = userInfo.sub;
      const folio = await this.folioRepository.find({
        relations: { folioContents: true },
        where: { userId },
        order: { id: 'ASC' },
      });
      this.sitesLogger.log('FolioService.getFoliosForUser() end');
      this.sitesLogger.debug('FolioService.getFoliosForUser() end');
      return folio;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioService.getFoliosForUser() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async getSitesForFolio(
    input: FolioMinDTO,
    userInfo: any,
  ): Promise<FolioContents[] | null> {
    this.sitesLogger.log('FolioService.getSitesForFolio() start');
    this.sitesLogger.debug('FolioService.getSitesForFolio() start');
    try {
      const userId = userInfo.sub;
      const { id } = input;
      const folio = await this.folioRepository.findOne({
        where: { id, userId },
      });

      if (folio) {
        this.sitesLogger.log('FolioService.getSitesForFolio() end');
        this.sitesLogger.debug('FolioService.getSitesForFolio() end');
        return this.folioContentService.getSiteForFolio(folio.id.toString());
      } else {
        this.sitesLogger.log('FolioService.getSitesForFolio() end');
        this.sitesLogger.debug('FolioService.getSitesForFolio() end');
        return null;
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioService.getSitesForFolio() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async addFolio(inputDTO: FolioDTO, userInfo: any): Promise<boolean> {
    this.sitesLogger.log('FolioService.addFolio() start');
    this.sitesLogger.debug('FolioService.addFolio() start');
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
          this.sitesLogger.log('FolioService.addFolio() end');
          this.sitesLogger.debug('FolioService.addFolio() end');
          return true;
        } else {
          this.sitesLogger.log('FolioService.addFolio() end');
          this.sitesLogger.debug('FolioService.addFolio() end');
          return false;
        }
      }
      this.sitesLogger.log('FolioService.addFolio() end');
      this.sitesLogger.debug('FolioService.addFolio() end');
      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioService.addFolio() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async updateFolio(inputArr: FolioDTO[], userInfo: any): Promise<boolean> {
    this.sitesLogger.log('FolioService.updateFolio() start');
    this.sitesLogger.debug('FolioService.updateFolio() start');
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
            this.sitesLogger.error(
              `Failed to save record with id `,
              `folioid: ${id}`,
            );
          }
        } else {
          this.sitesLogger.error(
            `Unable to find existing record for `,
            `folioid: ${id}`,
          );
        }
      });
      this.sitesLogger.log('FolioService.updateFolio() end');
      this.sitesLogger.debug('FolioService.updateFolio() end');
      await Promise.all(updatePromises);
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioService.updateFolio() end',
        JSON.stringify(error),
      );
      throw error;
    }

    return true;
  }

  async deleteFolio(id: number, userInfo: any): Promise<boolean> {
    this.sitesLogger.log('FolioService.deleteFolio() start');
    this.sitesLogger.debug('FolioService.deleteFolio() start');
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
        this.sitesLogger.log('FolioService.deleteFolio() end');
        this.sitesLogger.debug('FolioService.deleteFolio() end');
        return result.affected > 0;
      } else {
        this.sitesLogger.error(
          `unable to find saved folio for `,
          `folioid: ${id}`,
        );
      }

      this.sitesLogger.log('FolioService.deleteFolio() end');
      this.sitesLogger.debug('FolioService.deleteFolio() end');
      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioService.deleteFolio() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async addSiteToFolio(
    inputDTO: [FolioContentDTO],
    userInfo: any,
  ): Promise<boolean> {
    this.sitesLogger.log('FolioService.addSiteToFolio() start');
    this.sitesLogger.debug('FolioService.addSiteToFolio() start');
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

      this.sitesLogger.log('FolioService.addSiteToFolio() end');
      this.sitesLogger.debug('FolioService.addSiteToFolio() end');
      return true;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioService.addSiteToFolio() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async deleteSitesInFolio(
    inputDTO: [FolioContentDTO],
    userInfo: any,
  ): Promise<boolean> {
    this.sitesLogger.log('FolioService.deleteSitesInFolio() start');
    this.sitesLogger.debug('FolioService.deleteSitesInFolio() start');
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
      this.sitesLogger.log('FolioService.deleteSitesInFolio() end');
      this.sitesLogger.debug('FolioService.deleteSitesInFolio() end');
      return true;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioService.deleteSitesInFolio() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }
}
