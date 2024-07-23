import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Folio } from 'src/app/entities/folio.entity';
import { Repository } from 'typeorm';
import { FolioDTO, FolioMinDTO } from '../../dto/Folio';
import { plainToInstance } from 'class-transformer';
import { FolioContentsService } from './folioContents.service';
import { FolioContentDTO } from 'src/app/dto/folioContent';
import { FolioContents } from 'src/app/entities/folioContents.entity';

@Injectable()
export class FolioService {
  constructor(
    @InjectRepository(Folio)
    private folioRepository: Repository<Folio>,

    private folioContentService: FolioContentsService,
  ) {}

  async getFoliosForUser(userId: string): Promise<Folio[]> {
    try {
      const folio = await this.folioRepository.find({
        relations: { folioContents: true },
        where: { userId },
      });
      return folio;
    } catch (error) {
      throw error;
    }
  }

  async getSitesForFolio(input: FolioMinDTO): Promise<FolioContents[]> {
    try {
      const { id, userId } = input;
      const folio = await this.folioRepository.findOne({
        where: { id, userId },
      });

      if (folio) {
        return this.folioContentService.getSiteForFolio(folio.id.toString());
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  async addFolio(inputDTO: FolioDTO): Promise<boolean> {
    const { userId, id, folioId } = inputDTO;
    try {
      const existingRecord = await this.folioRepository.findOne({
        where: { userId, id },
      });

      if (existingRecord) {
        return false;
      } else {
        const folio = plainToInstance(Folio, inputDTO);
        folio.whenCreated = new Date();
        folio.whenUpdated = new Date();
        const result = await this.folioRepository.save(folio);

        if (result) {
          // inputDTO.folioContent.map((folioContent)=> {
          //   folioContent.folioId = folio.id.toString();
          //   this.folioContentService.addFolioContent(folioContent);
          // });
          return true;
        }
      }
    } catch (error) {
      throw new Error('Failed to add folio content');
    }
  }

  async updateFolio(inputArr: [FolioDTO]): Promise<boolean> {
    try {
      await inputArr.map((inputDTO) => {
        const { userId, id, folioId } = inputDTO;

        this.folioRepository
          .findOne({
            where: { id, userId },
          })
          .then((existingRecord) => {
            if (existingRecord) {
              existingRecord.description = inputDTO.description;
              existingRecord.folioId = inputDTO.folioId;
              existingRecord.whenUpdated = new Date();
              this.folioRepository.save(existingRecord).then((result) => {
                if (result) {
                  return true;
                } else {
                  return false;
                }
              });
            }
          });
      });
    } catch (error) {
      throw new Error('Failed to update folio content');
    }
    return true;
  }

  async deleteFolio(id: number): Promise<boolean> {
    try {
      if (id > 0) {
        const result = await this.folioRepository.delete({
          id: id,
        });
        if (result.affected > 0) return true;
        else return false;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  async addSiteToFolio(inputDTO: [FolioContentDTO]): Promise<boolean> {
    try {
      if (inputDTO.length > 0) {
        inputDTO.forEach((item) => {
          if (item != null) {
            const { userId, id } = item;
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
    } catch (e) {
      throw e;
    }
  }

  async deleteSitesInFolio(inputDTO: [FolioContentDTO]): Promise<boolean> {
    try {
      if (inputDTO.length > 0) {
        inputDTO.forEach((item) => {
          if (item != null) {
            const { userId, id } = item;
            this.folioRepository
              .findOne({ where: { id, userId } })
              .then((folio) => {
                if (folio) {
                  item.folioId = folio.id.toString();
                  this.folioContentService.deleteSitesInFolio(item.folioId,item.siteId);
                }
              });
          }
        });
      }

      return true;
    } catch (e) {
      throw e;
    }
  }
}
