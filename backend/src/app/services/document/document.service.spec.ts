import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentService } from './document.service';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { sampleSites } from '../../mockData/site.mockData';
import { PeopleOrgs } from '../../entities/peopleOrgs.entity';
import { LoggerService } from '../../logger/logger.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let siteDocsRepository: Repository<SiteDocs>;
  let sitesLogger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        LoggerService,
        {
          provide: getRepositoryToken(SiteDocs),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    sitesLogger = module.get<LoggerService>(LoggerService);
    siteDocsRepository = module.get<Repository<SiteDocs>>(
      getRepositoryToken(SiteDocs),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSiteDocumentsBySiteId', () => {
    it('should return transformed documents when siteId exists', async () => {
      const siteId = 'site1';
      const mockPeopleOrgs: PeopleOrgs[] = [
        {
          id: 'org1',
          organizationName: 'Organization 1', // Adding organizationName
          displayName: 'Participant 1',
          entityType: 'entityType',
          location: 'location',
          bcerCode: 'bcerCode',
          contactName: 'contactName',
          mailUserid: 'mailUserid',
          lastName: 'lastName',
          firstName: 'firstName',
          middleName: 'middleName',
          whoCreated: 'whoCreated',
          whoUpdated: null,
          whenCreated: new Date(),
          whenUpdated: null,
          endDate: null, // Adjust as per your entity definition
          eventPartics: [], // Populate if needed
          mailouts: [], // Populate if needed
          bcerCode2: null, // Assuming BceRegionCd relationship is not included here
          sisAddresses: [], // Populate if needed
          siteCrownLandContaminateds: [], // Populate if needed
          siteDocPartics: [], // Populate if needed
          sitePartics: [], // Populate if needed
          siteStaffs: [], // Populate if needed
        },
      ];
      const mockSiteDocs: SiteDocs[] = [
        {
          id: '1',
          siteId: 'site1',
          title: 'Document 1',
          note: '',
          submissionDate: new Date(),
          documentDate: new Date(),
          whoCreated: 'whoCreated',
          whoUpdated: null,
          whenCreated: new Date(),
          whenUpdated: null,
          rwmFlag: 1,
          rwmNoteFlag: null,
          userAction: 'pending',
          srAction: 'pending',
          filePath: '',
          siteDocPartics: [
            {
              id: '1',
              sdocId: '1',
              spId: 'sp1',
              psnorgId: 'org1',
              whoCreated: 'whoCreated',
              whoUpdated: null,
              whenCreated: new Date(),
              whenUpdated: null,
              rwmFlag: 1,
              dprCode: 'dpr1',
              dprCode2: null, // Assuming this relationship is already defined elsewhere
              psnorg: mockPeopleOrgs[0], // Assigning PeopleOrgs entity
              sdoc: null, // Assigning SiteDocs entity
              userAction: 'pending',
              srAction: 'pending',
            },
          ],
          site: sampleSites[0],
        },
      ];
      jest
        .spyOn(siteDocsRepository, 'find')
        .mockResolvedValueOnce(mockSiteDocs);

      const result = await service.getSiteDocumentsBySiteId(siteId, false);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0].id).toEqual(mockSiteDocs[0].id);
      expect(result[0].siteId).toEqual(mockSiteDocs[0].siteId);
      expect(result[0].psnorgId).toEqual(
        mockSiteDocs[0].siteDocPartics[0].psnorgId,
      );
      expect(result[0].displayName).toEqual(
        mockSiteDocs[0].siteDocPartics[0].psnorg.displayName,
      );
    });

    it('should return empty array when siteId does not exist', async () => {
      const siteId = 'nonExistentSite';
      jest.spyOn(siteDocsRepository, 'find').mockResolvedValueOnce([]);

      const result = await service.getSiteDocumentsBySiteId(siteId, false);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });

    it('should throw an error when repository throws an error', async () => {
      const siteId = 'site1';
      const mockError = new Error(
        'Failed to retrieve site documents by site id.',
      );
      jest.spyOn(siteDocsRepository, 'find').mockRejectedValueOnce(mockError);

      await expect(
        service.getSiteDocumentsBySiteId(siteId, false),
      ).rejects.toThrow(mockError);
    });
  });

  it('should transform and validate document data correctly', async () => {
    const siteId = 'site1';
    const mockPeopleOrgs: PeopleOrgs[] = [
      {
        id: 'org1',
        organizationName: 'Organization 1', // Adding organizationName
        displayName: 'Participant 1',
        entityType: 'entityType',
        location: 'location',
        bcerCode: 'bcerCode',
        contactName: 'contactName',
        mailUserid: 'mailUserid',
        lastName: 'lastName',
        firstName: 'firstName',
        middleName: 'middleName',
        whoCreated: 'whoCreated',
        whoUpdated: null,
        whenCreated: new Date(),
        whenUpdated: null,
        endDate: null, // Adjust as per your entity definition
        eventPartics: [], // Populate if needed
        mailouts: [], // Populate if needed
        bcerCode2: null, // Assuming BceRegionCd relationship is not included here
        sisAddresses: [], // Populate if needed
        siteCrownLandContaminateds: [], // Populate if needed
        siteDocPartics: [], // Populate if needed
        sitePartics: [], // Populate if needed
        siteStaffs: [], // Populate if needed
      },
    ];
    const mockSiteDocs: SiteDocs[] = [
      {
        id: '1',
        siteId: 'site1',
        title: 'Document 1',
        note: '',
        submissionDate: new Date(),
        documentDate: new Date(),
        whoCreated: 'whoCreated',
        whoUpdated: null,
        whenCreated: new Date(),
        whenUpdated: null,
        rwmFlag: 1,
        rwmNoteFlag: null,
        userAction: 'pending',
        srAction: 'pending',
        filePath: '',
        siteDocPartics: [
          {
            id: '1',
            sdocId: '1',
            spId: 'sp1',
            psnorgId: 'org1',
            whoCreated: 'whoCreated',
            whoUpdated: null,
            whenCreated: new Date(),
            whenUpdated: null,
            rwmFlag: 1,
            dprCode: 'dpr1',
            dprCode2: null, // Assuming this relationship is already defined elsewhere
            psnorg: mockPeopleOrgs[0], // Assigning PeopleOrgs entity
            sdoc: null, // Assigning SiteDocs entity
            srAction: 'pending',
            userAction: 'pending',
          },
        ],
        site: sampleSites[0],
      },
    ];
    jest.spyOn(siteDocsRepository, 'find').mockResolvedValueOnce(mockSiteDocs);

    const result = await service.getSiteDocumentsBySiteId(siteId, false);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(1);

    // Validate individual fields
    expect(result[0].id).toEqual(mockSiteDocs[0].id);
    expect(result[0].siteId).toEqual(mockSiteDocs[0].siteId);
    expect(result[0].psnorgId).toEqual(
      mockSiteDocs[0].siteDocPartics[0].psnorgId,
    );
    // expect(result[0].displayName).toEqual(mockSiteDocs[0].siteDocPartics[0].displayName);
  });
});
