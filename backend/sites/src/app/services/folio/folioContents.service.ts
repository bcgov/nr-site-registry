import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FolioContents } from '../../entities/folioContents.entity';
import { Repository } from 'typeorm';
import { FolioContentDTO } from '../../dto/folioContent.dto';
import { plainToInstance } from 'class-transformer';
import { elementAt } from 'rxjs';

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
      
        const folioContent = {
          siteId: inputDTO.siteId,
          folioId : inputDTO.folioId,
          whoCreated: inputDTO.whoCreated,
          userId: inputDTO.userId
        }
         
        const result = await this.folioContentRepository.save(folioContent);

        if (result) {
          return true;
        }
        else
        {
          return false;
        }
      }
    } catch (error) {
      throw error;
    }
  }


  async deleteFolioContent(folioContentId: string): Promise<boolean> {
    try {
      if (folioContentId && folioContentId != '') {
        const result = await this.folioContentRepository.delete({
          id: folioContentId,
        });
        if (result.affected > 0) return true;
        else return false;
      }
      else
      {
        console.log("folioContentId is null or empty")
      }

      return false;
    } catch (error) {
      throw error;
    }
  }

  async deleteSitesInFolio(folioId: string, siteId: string ): Promise<boolean> {
    try {
      if (folioId && siteId && folioId !== '' && siteId !== '') {
        const result = await this.folioContentRepository.delete({
          folioId: folioId,
          siteId: siteId
        });
        if (result.affected > 0) return true;
        else return false;
      }
      else
      {
        console.error("folioId or siteId is null or empty.")
      }

      return false;
    } catch (error) {
      throw error;
    }
  }

  async deleteAllSitesInFolio(folioId: string): Promise<boolean> {
    try {
      
      if (folioId && folioId !== '') {
        const result = await this.folioContentRepository.delete({
          folioId: folioId,         
        });
        if (result.affected > 0) return true;
        else return false;
      }
      else
      {
        console.error("folio id is null or empty");
      }

      return false;
    } catch (error) {
      throw error;
    }
  }
}
