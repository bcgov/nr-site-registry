import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FolioContents } from '../../entities/folioContents.entity';
import { Repository } from 'typeorm';
import { FolioContentDTO } from '../../dto/folioContent.dto';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class FolioContentsService {
  constructor(
    @InjectRepository(FolioContents)
    private folioContentRepository: Repository<FolioContents>,
    private readonly sitesLogger: LoggerService,
  ) {}

  async getSiteForFolio(folioId: string): Promise<FolioContents[]> {
    this.sitesLogger.log('FolioContentsService.getSiteForFolio() start');
    this.sitesLogger.debug('FolioContentsService.getSiteForFolio() start');
    try {
      const sitesForFolioArr = await this.folioContentRepository.find({
        relations: ['site', 'folio'],
        where: { folioId },
      });
      this.sitesLogger.log('FolioContentsService.getSiteForFolio() end');
      this.sitesLogger.debug('FolioContentsService.getSiteForFolio() end');
      return sitesForFolioArr;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioContentsService.getSiteForFolio() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve site for folio`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async addFolioContent(inputDTO: FolioContentDTO): Promise<boolean> {
    this.sitesLogger.log('FolioContentsService.addFolioContent() start');
    this.sitesLogger.debug('FolioContentsService.addFolioContent() start');
    const { siteId, folioId } = inputDTO;
    try {
      const existingRecord = await this.folioContentRepository.findOne({
        where: { siteId, folioId },
      });

      if (existingRecord) {
        this.sitesLogger.log('FolioContentsService.addFolioContent() end');
        this.sitesLogger.debug('FolioContentsService.addFolioContent() end');
        return false;
      } else {
        const folioContent = {
          siteId: inputDTO.siteId,
          folioId: inputDTO.folioId,
          whoCreated: inputDTO.whoCreated,
          userId: inputDTO.userId,
        };

        const result = await this.folioContentRepository.save(folioContent);

        this.sitesLogger.log('FolioContentsService.addFolioContent() end');
        this.sitesLogger.debug('FolioContentsService.addFolioContent() end');
        if (result) {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioContentsService.addFolioContent() end',
        JSON.stringify(error),
      );
      throw new HttpException(`Failed to add folio`, HttpStatus.NOT_FOUND);
    }
  }

  async deleteFolioContent(folioContentId: string): Promise<boolean> {
    this.sitesLogger.log('FolioContentsService.deleteFolioContent() start');
    this.sitesLogger.debug('FolioContentsService.deleteFolioContent() start');
    try {
      if (folioContentId && folioContentId != '') {
        const result = await this.folioContentRepository.delete({
          id: folioContentId,
        });
        this.sitesLogger.log('FolioContentsService.deleteFolioContent() end');
        this.sitesLogger.debug('FolioContentsService.deleteFolioContent() end');
        if (result.affected > 0) return true;
        else return false;
      } else {
        console.log('folioContentId is null or empty');
      }
      this.sitesLogger.log('FolioContentsService.deleteFolioContent() end');
      this.sitesLogger.debug('FolioContentsService.deleteFolioContent() end');
      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioContentsService.deleteFolioContent() end',
        JSON.stringify(error),
      );
      throw new HttpException(`Failed to delete folio`, HttpStatus.NOT_FOUND);
    }
  }

  async deleteSitesInFolio(folioId: string, siteId: string): Promise<boolean> {
    this.sitesLogger.log('FolioContentsService.deleteSitesInFolio() start');
    this.sitesLogger.debug('FolioContentsService.deleteSitesInFolio() start');
    try {
      if (folioId && siteId && folioId !== '' && siteId !== '') {
        const result = await this.folioContentRepository.delete({
          folioId: folioId,
          siteId: siteId,
        });
        this.sitesLogger.log('FolioContentsService.deleteSitesInFolio() end');
        this.sitesLogger.debug('FolioContentsService.deleteSitesInFolio() end');
        if (result.affected > 0) return true;
        else return false;
      } else {
        console.error('folioId or siteId is null or empty.');
      }
      this.sitesLogger.log('FolioContentsService.deleteSitesInFolio() end');
      this.sitesLogger.debug('FolioContentsService.deleteSitesInFolio() end');
      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioContentsService.deleteSitesInFolio() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to delete sites in folio`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async deleteAllSitesInFolio(folioId: string): Promise<boolean> {
    this.sitesLogger.log('FolioContentsService.deleteAllSitesInFolio() start');
    this.sitesLogger.debug(
      'FolioContentsService.deleteAllSitesInFolio() start',
    );
    try {
      if (folioId && folioId !== '') {
        const result = await this.folioContentRepository.delete({
          folioId: folioId,
        });
        this.sitesLogger.log(
          'FolioContentsService.deleteAllSitesInFolio() end',
        );
        this.sitesLogger.debug(
          'FolioContentsService.deleteAllSitesInFolio() end',
        );
        if (result.affected > 0) return true;
        else return false;
      } else {
        console.error('folio id is null or empty');
      }
      this.sitesLogger.log('FolioContentsService.deleteAllSitesInFolio() end');
      this.sitesLogger.debug(
        'FolioContentsService.deleteAllSitesInFolio() end',
      );

      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in FolioContentsService.deleteAllSitesInFolio() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to delete sites in folio`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
