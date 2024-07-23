import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SiteDocs } from "../../entities/siteDocs.entity";
import { Repository } from "typeorm";
import { response } from "express";
import { plainToInstance } from "class-transformer";
import { DocumentDto } from "src/app/dto/document.dto";

@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(SiteDocs)
        private siteDocsRepository: Repository<SiteDocs>
    ){}

    async getSiteDocumentsBySiteId( siteId: string)
    {
        try
        {
            const result = await this.siteDocsRepository.find({where : { siteId }})
            // return result;
            // if(result.length > 0)
            // {
            //     const response = result.map( res => {
            //         return res.siteDocPartics.map( sdp => ({
            //             id: res.id,
            //             siteId: res.siteId,
            //             submissionDate: res.submissionDate.toISOString(),
            //             documentDate: res.documentDate.toISOString(),
            //             title: res.title,
            //             psnorgId: sdp.psnorgId,
            //             displayName: sdp.psnorg.displayName,
            //         }))
            //     }).flat();

            //     const document = plainToInstance(DocumentDto, response);
            //     return document;
            // }

            const response = result.map( res => {
                    const document = {
                        id: res.id,
                        siteId: res.siteId,
                        title: res.title,
                        submissionDate: res.submissionDate.toISOString(),
                        documentDate: res.documentDate.toISOString(),
                    }
                let obj = [{psnorgId: '', displayName: ''}];
                if(res.siteDocPartics.length > 0)
                {
                    obj = res.siteDocPartics.map( sdp => ({
                        psnorgId: sdp.psnorgId,
                        displayName: sdp.psnorg.displayName,
                    }));
                }

                const doc = obj.map( item => ({...document, ...item}))
                return doc;
            }).flat();     
            
            const document = plainToInstance(DocumentDto, response);
            return document;
        }
        catch (error)
        {
            throw new Error('Failed to retrieve site documents by site id.')
        }
    }
}