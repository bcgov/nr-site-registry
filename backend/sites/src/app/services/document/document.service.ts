import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DocumentDto } from '../../dto/document.dto';
import { UserActionEnum } from 'src/app/common/userActionEnum';
import { LoggerService } from 'src/app/logger/logger.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(SiteDocs)
    private siteDocsRepository: Repository<SiteDocs>,
    private readonly sitesLogger: LoggerService,
  ) {}

  /**
   * Retrieves site documents by site ID and transforms the data into a specific format.
   * @param siteId - The ID of the site to retrieve documents for.
   * @returns A promise that resolves to an array of DocumentDto objects.
   * @throws Error if there is an issue retrieving the data.
   */
  async getSiteDocumentsBySiteId(siteId: string, showPending: boolean) {
    try {
      this.sitesLogger.log('DocumentService.getSiteDocumentsBySiteId() start');
      this.sitesLogger.debug(
        'DocumentService.getSiteDocumentsBySiteId() start',
      );
      let result: SiteDocs[] = [];
      if (showPending) {
        result = await this.siteDocsRepository.find({
          where: { siteId, userAction: UserActionEnum.UPDATED },
          relations: ['siteDocPartics', 'siteDocPartics.psnorg'],
        });
      } else {
        result = await this.siteDocsRepository.find({
          where: { siteId },
          relations: ['siteDocPartics', 'siteDocPartics.psnorg'],
        });
      }

      // Process and format the documents
      const response = result.flatMap((res) => {
        // Base document structure
        const document = {
          id: res.id,
          siteId: res.siteId,
          title: res.title,
          submissionDate: res.submissionDate.toISOString(),
          documentDate: res.documentDate
            ? res.documentDate.toISOString()
            : null,
        };

        // If there are associated siteDocPartics, map them
        if (res.siteDocPartics.length > 0) {
          return res.siteDocPartics.map((sdp) => ({
            ...document,
            docParticId: sdp.id,
            dprCode: sdp.dprCode,
            psnorgId: sdp.psnorgId,
            displayName: sdp.psnorg.displayName,
          }));
        }

        // If no siteDocPartics, return a single document with default values
        return [
          {
            ...document,
            psnorgId: '',
            displayName: '',
          },
        ];
      });

      // Convert plain objects to DocumentDto instances
      this.sitesLogger.log('DocumentService.getSiteDocumentsBySiteId() end');
      this.sitesLogger.debug('DocumentService.getSiteDocumentsBySiteId() end');
      return plainToInstance(DocumentDto, response);
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DocumentService.getSiteDocumentsBySiteId() end',
        JSON.stringify(error),
      );
      // Provide more context in the error message
      throw new Error('Failed to retrieve site documents by site id.');
    }
  }
}
