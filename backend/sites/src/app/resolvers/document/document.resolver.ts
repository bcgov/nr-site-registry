import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { DocumentService } from '../../services/document/document.service';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { UsePipes } from '@nestjs/common';
import { DocumentDto, DocumentResponse } from '../../dto/document.dto';
import { CustomRoles } from '../../common/role';
import { LoggerService } from 'src/app/logger/logger.service';

@Resolver(() => SiteDocs)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly genericResponseProvider: GenericResponseProvider<
      DocumentDto[]
    >,
    private readonly sitesLogger: LoggerService,
  ) {}

  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => DocumentResponse, { name: 'getSiteDocumentsBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteDocumentsBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
  ) {
    this.sitesLogger.log(
      'DocumentResolver.getSiteDocumentsBySiteId() start siteId:' +
        ' ' +
        siteId +
        ' showPending = ' +
        showPending,
    );

    const response = await this.documentService.getSiteDocumentsBySiteId(
      siteId,
      showPending,
    );
    if (response && response.length > 0) {
      this.sitesLogger.log(
        'DocumentResolver.getSiteDocumentsBySiteId() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Documents fetched successfully.',
        200,
        true,
        response,
      );
    } else {
      this.sitesLogger.log(
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
