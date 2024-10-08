import { Test, TestingModule } from '@nestjs/testing';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from '../../services/document/document.service';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { DocumentDto, DocumentResponse } from '../../dto/document.dto';

describe('DocumentResolver', () => {
  let resolver: DocumentResolver;
  let documentService: DocumentService;
  let genericResponseProvider: GenericResponseProvider<DocumentDto[]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentResolver,
        {
          provide: DocumentService,
          useValue: {
            getSiteDocumentsBySiteId: jest.fn(),
          },
        },
        {
          provide: GenericResponseProvider,
          useValue: {
            createResponse: jest.fn(
              (
                message: string,
                httpStatusCode: number,
                success: boolean,
                data?: DocumentDto[],
              ) => ({
                message,
                httpStatusCode,
                success,
                data,
              }),
            ),
          },
        },
      ],
    }).compile();

    resolver = module.get<DocumentResolver>(DocumentResolver);
    documentService = module.get<DocumentService>(DocumentService);
    genericResponseProvider = module.get<
      GenericResponseProvider<DocumentDto[]>
    >(GenericResponseProvider);
  });

  it('should return site documents if found', async () => {
    const siteId = '123';
    const mockDocuments: DocumentDto[] = [
      {
        id: '1',
        siteId: 'SITE456',
        title: 'Document 1',
        psnorgId: '1',
        displayName: 'Display Name',
        submissionDate: new Date('2024-07-17').toISOString(),
        documentDate: new Date('2024-07-17').toISOString(),
      },
    ];
    const expectedResult: DocumentResponse = {
      message: 'Documents fetched successfully.',
      httpStatusCode: 200,
      success: true,
      data: mockDocuments,
    };
    jest
      .spyOn(documentService, 'getSiteDocumentsBySiteId')
      .mockResolvedValueOnce(mockDocuments);

    const result = await resolver.getSiteDocumentsBySiteId(siteId);

    expect(result).toEqual(expectedResult);
    expect(mockDocuments[0].id).toEqual('1');
    expect(mockDocuments[0].psnorgId).toEqual('1');
    expect(documentService.getSiteDocumentsBySiteId).toHaveBeenCalledWith(
      siteId,
    );
    expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
      'Documents fetched successfully.',
      200,
      true,
      mockDocuments,
    );
  });

  it('should return error message if site documents not found', async () => {
    const siteId = '123';
    const mockEmptyDocuments: DocumentDto[] = [];
    const expectedResult: DocumentResponse = {
      message: `Documents not found for site id ${siteId}`,
      httpStatusCode: 404,
      success: false,
      data: null,
    };

    jest
      .spyOn(documentService, 'getSiteDocumentsBySiteId')
      .mockResolvedValueOnce(mockEmptyDocuments);

    const result = await resolver.getSiteDocumentsBySiteId(siteId);

    expect(result).toEqual(expectedResult);
    expect(documentService.getSiteDocumentsBySiteId).toHaveBeenCalledWith(
      siteId,
    );
    expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
      `Documents not found for site id ${siteId}`,
      404,
      false,
      null,
    );
  });

  it('should validate siteId parameter type', async () => {
    const siteId = 123; // Invalid type
    const mockEmptyDocuments: DocumentDto[] = [];

    jest
      .spyOn(documentService, 'getSiteDocumentsBySiteId')
      .mockResolvedValueOnce(mockEmptyDocuments);

    const result = await resolver.getSiteDocumentsBySiteId(siteId as any);

    expect(result.httpStatusCode).toEqual(404);
    expect(result.success).toEqual(false);
    expect(result.message).toContain(
      `Documents not found for site id ${siteId}`,
    );
  });

  it('should return an error for empty siteId parameter', async () => {
    const siteId = '';
    const mockEmptyDocuments: DocumentDto[] = [];

    const result = await resolver.getSiteDocumentsBySiteId(siteId);

    expect(result.httpStatusCode).toEqual(404);
    expect(result.success).toEqual(false);
    expect(result.message).toContain('Documents not found for site id ');
  });

  it('should handle large data response efficiently', async () => {
    const siteId = '123';
    const mockLargeDocuments: DocumentDto[] = new Array(1000).fill({
      id: '1',
      siteId: 'SITE456',
      title: 'Document 1',
      psnorgId: '1',
      displayName: 'Display Name',
      submissionDate: new Date('2024-07-17'),
      documentDate: new Date('2024-07-17'),
    });

    jest
      .spyOn(documentService, 'getSiteDocumentsBySiteId')
      .mockResolvedValueOnce(mockLargeDocuments);

    const result = await resolver.getSiteDocumentsBySiteId(siteId);

    expect(result.success).toEqual(true);
    expect(result.data).toHaveLength(1000);
  });
});
