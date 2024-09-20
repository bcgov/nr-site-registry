import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { DocumentService } from '../../services/document/document.service';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { UsePipes } from '@nestjs/common';
import { DocumentDto, DocumentResponse } from '../../dto/document.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => SiteDocs)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly genericResponseProvider: GenericResponseProvider<
      DocumentDto[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => DocumentResponse, { name: 'getSiteDocumentsBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteDocumentsBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
  ) {
    sitesLogger.info(
      'DocumentResolver.getSiteDocumentsBySiteId() start siteId:' +
        ' ' +
        siteId,
    );
    const response =
      await this.documentService.getSiteDocumentsBySiteId(siteId);
    if (response && response.length > 0) {
      sitesLogger.info(
        'DocumentResolver.getSiteDocumentsBySiteId() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Documents fetched successfully.',
        200,
        true,
        response,
      );
    } else {
      sitesLogger.info(
        'DocumentResolver.getSiteDocumentsBySiteId() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Documents not found for site id ${siteId}`,
        404,
        false,
        null,
      );
    }
  }
}
