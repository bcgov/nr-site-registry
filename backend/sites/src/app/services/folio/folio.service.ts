import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folio } from '../../entities/folio.entity';
import { Repository } from 'typeorm';
import { FolioDTO, FolioMinDTO } from '../../dto/Folio';
import { plainToInstance } from 'class-transformer';
import { FolioContentsService } from './folioContents.service';
import { FolioContentDTO } from '../../dto/folioContent';
import { FolioContents } from '../../entities/folioContents.entity';

@Injectable()
export class FolioService {
  constructor(
    @InjectRepository(Folio)
    private folioRepository: Repository<Folio>,

    private folioContentService: FolioContentsService,
  ) {}

  async getFoliosForUser(userInfo: any): Promise<Folio[]> {
    try {
      const userId = userInfo.sub;
      const folio = await this.folioRepository.find({
        relations: { folioContents: true },
        where: { userId },
        order: { id: 'ASC'}
      })
      return folio;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  async getSitesForFolio(
    input: FolioMinDTO,
    userInfo: any,
  ): Promise<FolioContents[] | null> {
    try {
      const userId = userInfo.sub;
      const { id } = input;
      const folio = await this.folioRepository.findOne({
        where: { id, userId },
      });

      if (folio) {
        return this.folioContentService.getSiteForFolio(folio.id.toString());
      }

      return null;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  async addFolio(inputDTO: FolioDTO, userInfo: any): Promise<boolean> {
    try {
      const { folioId } = inputDTO;

      const userId = userInfo.sub;

      const existingRecord = await this.folioRepository.findOne({
        where: { userId, folioId },
      });

      if (existingRecord) {
        return false;
      } else {
        const folio = plainToInstance(Folio, inputDTO);
        folio.whenCreated = new Date();
        folio.whenUpdated = new Date();
        const result = await this.folioRepository.save(folio);

        if (result) return true;

        return false;
      }
    } catch (error) {
      console.error('Error', error);
      throw new Error('Failed to add folio content');
    }
  }

  async updateFolio(inputArr: FolioDTO[], userInfo: any): Promise<boolean> {
    try {
      const userId = userInfo.sub;
      for (const inputDTO of inputArr) {
        const { id } = inputDTO;

        const existingRecord = await this.folioRepository.findOne({
          where: { id, userId },
        });

        if (existingRecord) {
          existingRecord.description = inputDTO.description;
          existingRecord.folioId = inputDTO.folioId;
          existingRecord.whenUpdated = new Date();

          const result = await this.folioRepository.save(existingRecord);

          if (!result) {
            // Handle the case where save did not return the expected result
            console.error(`Failed to save record with id ${id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error', error);
      throw new Error('Failed to update folio content');
    }
    return true;
  }

  async deleteFolio(id: number, userInfo: any): Promise<boolean> {
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
        return result.affected > 0;
      }

      return false;
    } catch (error) {
      console.error('Error in deleteFolio:', error);
      return false;
    }
  }

  async addSiteToFolio(
    inputDTO: [FolioContentDTO],
    userInfo: any,
  ): Promise<boolean> {
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

      return true;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  async deleteSitesInFolio(
    inputDTO: [FolioContentDTO],
    userInfo: any,
  ): Promise<boolean> {
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

      return true;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }
}
