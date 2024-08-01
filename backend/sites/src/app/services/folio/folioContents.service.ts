import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FolioContents } from '../../entities/folioContents.entity';
import { Repository } from 'typeorm';
import { FolioContentDTO } from '../../dto/folioContent';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FolioContentsService {
  constructor(
    @InjectRepository(FolioContents)
    private folioContentRepository: Repository<FolioContents>,
  ) {}


  async getSiteForFolio(folioId: string): Promise<FolioContents[]> {
    try {
      const sitesForFolioArr = await this.folioContentRepository.find({  
        relations: ['site','folio'],
        where: { folioId },
      });
      return sitesForFolioArr;
    } catch (error) {
      throw error;
    }
  }


  async addFolioContent(inputDTO: FolioContentDTO): Promise<boolean> {
    const { siteId, folioId } = inputDTO;
    try {
      const existingRecord = await this.folioContentRepository.findOne({
        where: { siteId, folioId },
      });

      if (existingRecord) {
        return false;
      } else {
        delete inputDTO.id;
        const folioContent = plainToInstance(FolioContents, inputDTO); 
         
        const result = await this.folioContentRepository.save(folioContent);

        if (result) {
          return true;
        }
      }
    } catch (error) {
      throw new Error('Failed to add folio content');
    }
  }


  async deleteFolioContent(folioContentId: string): Promise<boolean> {
    try {
      if (folioContentId != '') {
        const result = await this.folioContentRepository.delete({
          id: folioContentId,
        });
        if (result.affected > 0) return true;
        else return false;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  async deleteSitesInFolio(folioId: string, siteId: string ): Promise<boolean> {
    try {
      if (folioId && siteId) {
        const result = await this.folioContentRepository.delete({
          folioId: folioId,
          siteId: siteId
        });
        if (result.affected > 0) return true;
        else return false;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  async deleteAllSitesInFolio(folioId: string): Promise<boolean> {
    try {
      
      if (folioId) {
        const result = await this.folioContentRepository.delete({
          folioId: folioId,         
        });
        if (result.affected > 0) return true;
        else return false;
      }

      return false;
    } catch (e) {
      return false;
    }
  }
}
