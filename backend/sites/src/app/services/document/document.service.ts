import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DocumentDto } from '../../dto/document.dto';
import { UserActionEnum } from 'src/app/common/userActionEnum';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(SiteDocs)
    private siteDocsRepository: Repository<SiteDocs>,
  ) {}

  async getSiteDocumentsBySiteId(siteId: string,showPending : boolean) {
    try {
      let result: SiteDocs[] = [];
      if(showPending)
      {
        result = await this.siteDocsRepository.find({ where: { siteId , userAction: UserActionEnum.updated  }  });
      }
      else
      {
        result = await this.siteDocsRepository.find({ where: { siteId } });
      }
      
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
        return document;
      }
    } catch (error) {
      throw new Error('Failed to retrieve site documents by site id.');
    }
  }
}
