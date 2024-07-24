import { GenericResponseProvider } from "../../dto/response/genericResponseProvider";
import { SiteDocs } from "../../entities/siteDocs.entity";
import { DocumentService } from "../../services/document/document.service";
import { RoleMatchingMode, Roles } from "nest-keycloak-connect";
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GenericValidationPipe } from "../../utils/validations/genericValidationPipe";
import { UsePipes } from "@nestjs/common";
import { DocumentDto, DocumentResponse } from "../../dto/document.dto";


@Resolver(() => SiteDocs)
export class DocumentResolver {
    constructor(
        private readonly documentService: DocumentService,
        private readonly genericResponseProvider: GenericResponseProvider<DocumentDto[]>,
    ){}

    @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
    @Query(() => DocumentResponse, { name: 'getSiteDocumentsBySiteId' })
    @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
    async getSiteDocumentsBySiteId( @Args('siteId', { type: () => String }) siteId: string,)
    {
        const response = await this.documentService.getSiteDocumentsBySiteId(siteId);
        if(response && response.length > 0)
        {
            return this.genericResponseProvider.createResponse('Documents fetched successfully.', 200, true, response);
        }
        else
        {
            return this.genericResponseProvider.createResponse(`Documents not found for site id ${siteId}`, 404, false, null);
        }
    }
}