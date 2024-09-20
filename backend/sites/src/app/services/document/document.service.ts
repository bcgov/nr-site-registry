import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DocumentDto } from '../../dto/document.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(SiteDocs)
    private siteDocsRepository: Repository<SiteDocs>,
  ) {}

  async getSiteDocumentsBySiteId(siteId: string) {
    sitesLogger.info('DocumentService.getSiteDocumentsBySiteId() start');
    sitesLogger.debug('DocumentService.getSiteDocumentsBySiteId() start');
    try {
      const result = await this.siteDocsRepository.find({ where: { siteId } });
      if (result) {
        const response = result
          .map((res) => {
            const document = {
              id: res.id,
              siteId: res.siteId,
              title: res.title,
              submissionDate: res.submissionDate.toISOString(),
              documentDate: res.documentDate.toISOString(),
            };
            let obj = [{ psnorgId: '', displayName: '' }];
            if (res.siteDocPartics.length > 0) {
              obj = res.siteDocPartics.map((sdp) => ({
                psnorgId: sdp.psnorgId,
                displayName: sdp.psnorg.displayName,
              }));
            }

            const doc = obj.map((item) => ({ ...document, ...item }));
            return doc;
          })
          .flat();

        const document = plainToInstance(DocumentDto, response);
        sitesLogger.info('DocumentService.getSiteDocumentsBySiteId() end');
        sitesLogger.debug('DocumentService.getSiteDocumentsBySiteId() end');
        return document;
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DocumentService.getSiteDocumentsBySiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve site documents by site id.');
    }
  }
}
