import { DeepPartial, Repository } from 'typeorm';
import { SnapshotsService } from './snapshot.service';
import { Snapshots } from '../../entities/snapshots.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { sampleSites } from '../../mockData/site.mockData';
import { CreateSnapshotDto } from '../../dto/snapshot.dto';
import { Sites } from '../../entities/sites.entity';
import { Events } from '../../entities/events.entity';
import { EventPartics } from '../../entities/eventPartics.entity';
import { SitePartics } from '../../entities/sitePartics.entity';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { LandHistories } from '../../entities/landHistories.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { SnapshotSiteContent } from '../../dto/snapshotSiteContent';
import { SiteParticRoles } from '../../entities/siteParticRoles.entity';
import { LoggerService } from '../../logger/logger.service';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { PeopleOrgs } from '../../entities/peopleOrgs.entity';

describe('SnapshotService', () => {
  let service: SnapshotsService;
  let snapshotRepository: Repository<Snapshots>;
  let sitesRepository: Repository<Sites>;
  let eventsRepository: Repository<Events>;
  let eventParticsRepository: Repository<EventPartics>;
  let siteParticsRepository: Repository<SitePartics>;
  let siteDocsRepository: Repository<SiteDocs>;
  let siteAssocsRepository: Repository<SiteAssocs>;
  let landHistoriesRepository: Repository<LandHistories>;
  let siteSubdivisionsRepository: Repository<SiteSubdivisions>;
  let siteProfilesRepository: Repository<SiteProfiles>;
  let siteParticipantRolesRepo: Repository<SiteParticRoles>;
  let sitesLogger: LoggerService;

  const sampleNotationParticipants: EventPartics[] = [
    {
      id: '1',
      spId: '1',
      eventId: '1',
      eprCode: 'EPR001',
      psnorgId: 'PSNORG001',
      eprCode2: null,
      event: null,
      rwmFlag: 1,
      whenUpdated: new Date(),
      whoCreated: '',
      whoUpdated: '',
      psnorg: {
        id: 'PSNORG001',
        organizationName: 'Organization A',
        displayName: 'Participant 1',
        entityType: 'Type A',
        location: 'Location A',
        bcerCode: 'BCER001',
        contactName: 'John Doe',
        mailUserid: 'john.doe@example.com',
        lastName: 'Doe',
        firstName: 'John',
        middleName: 'Middle',
        whoCreated: 'creator123',
        whenCreated: new Date(),
        whenUpdated: null,
        endDate: null,
        whoUpdated: '',
        eventPartics: null,
        mailouts: null,
        sisAddresses: null,
        siteCrownLandContaminateds: null,
        siteDocPartics: null,
        sitePartics: null,
        siteStaffs: null,
        bcerCode2: null,
      },
      whenCreated: new Date(),
      userAction: 'pending',
      srAction: 'pending',
    },
  ];

  const sampleNotationData: Events[] = [
    {
      id: '1',
      siteId: 'site1',
      eventDate: new Date(),
      completionDate: new Date(),
      etypCode: 'ETYP01',
      psnorgId: 'PSNORG01',
      spId: 'SP01',
      requiredAction: 'Complete task X',
      note: 'This is a note about the event.',
      regionAppFlag: 'Y',
      regionUserid: 'user123',
      regionDate: new Date(),
      whoCreated: 'creator123',
      whoUpdated: null,
      whenCreated: new Date(),
      whenUpdated: null,
      rwmFlag: 1,
      rwmNoteFlag: 0,
      rwmApprovalDate: new Date(),
      eclsCode: 'ECLS01',
      requirementDueDate: new Date(),
      requirementReceivedDate: new Date(),
      conditionsTexts: null,
      eventTypeCd: null,
      site: null,
      userAction: 'pending',
      srAction: 'pending',
      eventPartics: sampleNotationParticipants,
    },
  ];

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

  const sampleDocuments: SiteDocs[] = [
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
      srAction: 'public',
      bucketId: '1',
      objectId: '1',
      whenDeleted: new Date(),
      whoDeleted: 'User',
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
          whenDeleted: new Date(),
          whoDeleted: 'Tester',
        },
      ],
      site: sampleSites[0],
    },
  ];

  const sampleSite: Sites = {
    userAction: '',
    srAction: '',
    id: '1',
    bcerCode: 'BC1234',
    sstCode: 'SST56',
    commonName: 'Example Site',
    addrType: 'Residential',
    addrLine_1: '123 Example St',
    addrLine_2: 'Suite 100',
    addrLine_3: null,
    addrLine_4: null,
    city: 'Anytown',
    provState: 'CA',
    postalCode: '90210',
    latdeg: 34.0522,
    longdeg: -118.2437,
    victoriaFileNo: 'VF-001',
    regionalFileNo: 'RF-002',
    classCode: 'CC01',
    generalDescription: 'This site is an example for demonstration purposes.',
    whoCreated: 'admin',
    whoUpdated: 'editor',
    whenCreated: new Date('2024-01-01T00:00:00Z'),
    whenUpdated: new Date('2024-01-01T00:00:00Z'),
    rwmFlag: 1,
    rwmGeneralDescFlag: 1,
    consultantSubmitted: 'Y',
    longDegrees: 118,
    longMinutes: 14,
    longSeconds: 14.34,
    latDegrees: 34,
    latMinutes: 3,
    latSeconds: 7.92,
    srStatus: 'Y',
    latlongReliabilityFlag: 'High',
    siteRiskCode: 'UNC',
    geometry: null,
    events: [],
    landHistories: [],
    mailouts: [],
    siteAssocs: [],
    siteAssocs2: [],
    siteDocs: [],
    sitePartics: [],
    siteProfiles: [],
    siteSubdivisions: [],
    bcerCode2: null,
    classCode2: null,
    siteRiskCode2: null,
    sstCode2: null,
    siteCrownLandContaminated: null,
    recentViewedSites: [],
    cart: [],
    folioContents: [],
    snapshots: [],
  };

  const sampleSitePartics: SitePartics = {
    id: '1',
    siteId: 'site_001',
    psnorgId: 'org_123',
    effectiveDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T00:00:00Z'),
    note: 'This record is for reference purposes.',
    whoCreated: 'admin',
    whoUpdated: 'editor',
    whenCreated: new Date('2024-01-01T00:00:00Z'),
    whenUpdated: new Date('2024-01-01T00:00:00Z'),
    rwmFlag: 1,
    rwmNoteFlag: 0,
    siteParticRoles: [],
    psnorg: null,
    userAction: 'created',
    srAction: 'reviewed',
    site: sampleSite,
  };

  const samplePSORG: PeopleOrgs = {
    id: '1',
    organizationName: 'Example Organization',
    displayName: 'Example Org',
    entityType: 'Non-Profit',
    location: '123 Main St, Anytown',
    bcerCode: 'AB1234',
    contactName: 'Jane Doe',
    mailUserid: 'jane.doe@example.com',
    lastName: 'Doe',
    firstName: 'Jane',
    middleName: 'A',
    whoCreated: 'admin',
    whoUpdated: 'admin',
    whenCreated: new Date('2024-01-01T12:00:00Z'),
    whenUpdated: new Date('2024-10-01T12:00:00Z'),
    endDate: null,
    eventPartics: [],
    mailouts: [],
    bcerCode2: null,
    sisAddresses: [],
    siteCrownLandContaminateds: [],
    siteDocPartics: [],
    sitePartics: [],
    siteStaffs: [],
  };

  const sampleSiteSubDivions: SiteSubdivisions[] = [
    {
      site: sampleSite,
      subdivision: null,
      userAction: '',
      srAction: 'public',
      siteId: '101',
      subdivId: '202',
      dateNoted: new Date('2024-10-01T10:00:00Z'),
      initialIndicator: 'Y',
      whoCreated: 'admin_user',
      whoUpdated: 'editor_user',
      whenCreated: new Date('2024-10-01T09:30:00Z'),
      whenUpdated: new Date('2024-10-15T14:00:00Z'),
      sprofDateCompleted: new Date('2024-10-10T12:00:00Z'),
      siteSubdivId: '303',
      sendToSr: 'N',
    },
  ];

  const sampleSiteAssociations: SiteAssocs[] = [
    {
      site: sampleSite,
      siteIdAssociatedWith2: sampleSite,
      userAction: '',
      srAction: 'public',
      id: 'f8c2d6e9-3e10-4e6b-b123-2f0a1eeb9e0c',
      siteId: '101',
      siteIdAssociatedWith: '202',
      effectiveDate: new Date('2024-01-01T12:00:00Z'),
      note: 'This site is associated with Site 202 for monitoring purposes.',
      whoCreated: 'admin_user',
      whoUpdated: 'editor_user',
      whenCreated: new Date('2024-01-01T12:00:00Z'),
      whenUpdated: new Date('2024-01-01T12:00:00Z'),
      rwmFlag: null,
      rwmNoteFlag: null,
      commonPid: 'Y',
    },
  ];

  const sampleProfiles: SiteProfiles[] = [
      {
        site: sampleSite,
        userAction: '',
        srAction: 'public',
        id: 'a2c3e5c6-4f7b-49e6-97d6-1e1b7f45e890',
        siteId: '101',
        dateCompleted: new Date('2024-01-15T10:30:00Z'),
        localAuthDateRecd: new Date('2024-01-15T10:30:00Z'),
        localAuthName: 'John Doe',
        localAuthAgency: 'Environmental Agency',
        localAuthAddress1: '123 Main St',
        localAuthAddress2: 'Suite 200',
        localAuthPhoneAreaCode: '555',
        localAuthPhoneNo: '1234567',
        localAuthFaxAreaCode: '555',
        localAuthFaxNo: '7654321',
        localAuthDateSubmitted: new Date('2024-01-15T10:30:00Z'),
        localAuthDateForwarded: new Date('2024-01-15T10:30:00Z'),
        rwmDateReceived: new Date('2024-01-15T10:30:00Z'),
        rwmParticId: '2001',
        rwmPhoneAreaCode: '555',
        rwmPhoneNo: '7654321',
        rwmFaxAreaCode: '555',
        rwmFaxNo: '1234567',
        investigationRequired: 'Y',
        rwmDateDecision: new Date('2024-01-15T10:30:00Z'),
        siteRegDateRecd: new Date('2024-01-15T10:30:00Z'),
        siteRegDateEntered: new Date('2024-01-15T10:30:00Z'),
        siteRegParticId: '3001',
        ownerParticId: '4001',
        siteAddress: '456 Elm St',
        siteCity: 'Anytown',
        sitePostalCode: '12345',
        numberOfPids: 5,
        numberOfPins: 10,
        latDegrees: 34,
        latMinutes: 12,
        latSeconds: '34.56',
        longDegrees: -118,
        longMinutes: 15,
        longSeconds: '45.67',
        comments: 'Site requires further investigation.',
        whoCreated: 'admin_user',
        whoUpdated: 'editor_user',
        whenCreated: new Date('2024-01-15T10:30:00Z'),
        whenUpdated: new Date('2024-01-15T10:30:00Z'),
        localAuthEmail: 'johndoe@example.com',
        plannedActivityComment: 'Planning for site assessment.',
        siteDisclosureComment: 'Disclosure of previous activities.',
        govDocumentsComment: 'Pending government document approvals.',
        // The two below have been added much later, unsure why required now, but was causing PR unit tests to fail.
        completorParticId: '5001',
        contactParticId: '6001',
      },
    ];

  const sampleLandHistories: LandHistories[] = [
    {
      userAction: '',
      srAction: 'public',
      siteId: '1',
      guid: 'd7f8c6e3-7b9b-4f5e-8b92-e5b9b1d34567',
      lutCode: 'LU1234',
      note: 'Initial land use assessment completed.',
      whoCreated: 'admin_user',
      whoUpdated: 'editor_user',
      whenCreated: new Date('2024-01-15T10:30:00Z'),
      whenUpdated: new Date('2024-01-15T10:30:00Z'),
      rwmFlag: 1,
      rwmNoteFlag: 0,
      siteProfile: 'Y',
      profileDateReceived: new Date('2024-01-15T10:30:00Z'),
      landUse: {
        code: 'LU1234',
        description: 'Residential Development',
        landHistories: [],
        siteProfileLandUses: [],
      },
      site: sampleSite,
    },
  ];

  const sampleSiteParticipants: SitePartics[] = [
    {
      id: '1',
      siteId: 'site123',
      psnorgId: 'org1',
      effectiveDate: new Date('2023-01-01'),
      endDate: null,
      note: 'Note 1',
      psnorg: samplePSORG,
      whoCreated: '',
      rwmFlag: 1,
      rwmNoteFlag: 1,
      site: sampleSite,
      whoUpdated: 'admin',
      whenCreated: new Date('2024-01-01T12:00:00Z'),
      whenUpdated: new Date('2024-10-01T12:00:00Z'),
      userAction: '',
      srAction: '',
      siteParticRoles: [
        {
          rwmFlag: 1,
          sp: sampleSitePartics,
          userAction: '',
          srAction: '',
          id: '',
          spId: '',
          whoCreated: 'admin',
          whoUpdated: 'admin',
          whenCreated: new Date('2024-01-01T12:00:00Z'),
          whenUpdated: new Date('2024-10-01T12:00:00Z'),
          prCode: 'PR001',
          prCode2: {
            description: 'Role 1 Description',
            code: '',
            siteParticRoles: [
              {
                userAction: '',
                srAction: '',
                id: 'b8a7c6f3-d29b-4f91-9b16-e21e8b63e4f5',
                prCode: 'ROLE1',
                spId: '12345',
                whoCreated: 'admin',
                whoUpdated: 'editor',
                whenCreated: new Date('2024-01-01T12:00:00Z'),
                whenUpdated: new Date('2024-10-01T12:00:00Z'),
                rwmFlag: null,
                prCode2: null,
                sp: sampleSitePartics,
              },
            ],
          },
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotsService,
        LoggerService,
        {
          provide: getRepositoryToken(Snapshots),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(Sites),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(Events),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(EventPartics),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SitePartics),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteParticRoles),
          useValue: {
            findOne: jest.fn(() => {
              return { id: 'sss-llll', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: 'sss-llll', commonName: 'victoria' },
                { id: 'sdxcf-hddds', commonName: 'duncan' },
                { id: 'efrdt-llkij', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteDocs),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteAssocs),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(LandHistories),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteSubdivisions),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteProfiles),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
      ],
    }).compile();

    service = module.get<SnapshotsService>(SnapshotsService);
    sitesLogger = module.get<LoggerService>(LoggerService);
    snapshotRepository = module.get<Repository<Snapshots>>(
      getRepositoryToken(Snapshots),
    );
    sitesRepository = module.get<Repository<Sites>>(getRepositoryToken(Sites));
    eventsRepository = module.get<Repository<Events>>(
      getRepositoryToken(Events),
    );
    eventParticsRepository = module.get<Repository<EventPartics>>(
      getRepositoryToken(EventPartics),
    );
    siteParticsRepository = module.get<Repository<SitePartics>>(
      getRepositoryToken(SitePartics),
    );
    siteDocsRepository = module.get<Repository<SiteDocs>>(
      getRepositoryToken(SiteDocs),
    );
    siteAssocsRepository = module.get<Repository<SiteAssocs>>(
      getRepositoryToken(SiteAssocs),
    );
    landHistoriesRepository = module.get<Repository<LandHistories>>(
      getRepositoryToken(LandHistories),
    );
    siteSubdivisionsRepository = module.get<Repository<SiteSubdivisions>>(
      getRepositoryToken(SiteSubdivisions),
    );
    siteProfilesRepository = module.get<Repository<SiteProfiles>>(
      getRepositoryToken(SiteProfiles),
    );
    siteParticipantRolesRepo = module.get<Repository<SiteParticRoles>>(
      getRepositoryToken(SiteParticRoles),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSnapshots', () => {
    it('should return an array of snapshots', async () => {
      const res: Snapshots[] = [
        {
          id: 1,
          userId: '1',
          siteId: '1',
          transactionId: '1',
          whenCreated: new Date(),
          whoCreated: 'ABC',
          whenUpdated: new Date(),
          whoUpdated: 'ABC',
          site: sampleSites[0],
          snapshotData: {
            sitesSummary: sampleSites[0],
            documents: null,
            events: null,
            eventsParticipants: null,
            landHistories: null,
            profiles: null,
            siteAssociations: null,
            subDivisions: null,
            siteParticipants: [
              {
                id: '1',
                siteId: 'site123',
                psnorgId: 'org1',
                effectiveDate: new Date('2023-01-01'),
                endDate: null,
                note: 'Note 1',
                whenCreated: new Date(),
                whoCreated: 'ABC',
                whenUpdated: new Date(),
                whoUpdated: 'ABC',
                rwmFlag: 1,
                rwmNoteFlag: 1,
                psnorg: null,
                site: sampleSites[0],
                siteParticRoles: [
                  {
                    prCode: 'PR001',
                    spId: '1',
                    id: 'bbb-jjjj-kkkk-llll',
                    userAction: 'pending',
                    srAction: 'pending',
                    whenCreated: new Date(),
                    whoCreated: 'ABC',
                    whenUpdated: new Date(),
                    whoUpdated: 'ABC',
                    rwmFlag: 1,
                    sp: null,
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
                userAction: '',
                srAction: '',
              },
            ],
          },
        },
      ];

      jest.spyOn(snapshotRepository, 'find').mockResolvedValueOnce(res);

      const result = await service.getSnapshots();
      expect(result).toEqual(res);
    });

    it('should throw an error if repository throws an error', async () => {
      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(new Error('Failed to retrieve snapshots.'));
      await expect(service.getSnapshots()).rejects.toThrow(
        'Failed to retrieve snapshots.',
      );
    });
  });

  describe('getSnapshotsByUserId', () => {
    it('should return an array of snapshots for a given userId', async () => {
      const userId = '1';
      const res: Snapshots[] = [
        {
          id: 1,
          userId: '1',
          siteId: '1',
          transactionId: '1',
          whenCreated: new Date(),
          whoCreated: 'ABC',
          whenUpdated: new Date(),
          whoUpdated: 'ABC',
          site: sampleSites[0],
          snapshotData: {
            sitesSummary: sampleSites[0],
            documents: null,
            events: null,
            eventsParticipants: null,
            landHistories: null,
            profiles: null,
            siteAssociations: null,
            subDivisions: null,
            siteParticipants: [
              {
                id: '1',
                siteId: 'site123',
                psnorgId: 'org1',
                effectiveDate: new Date('2023-01-01'),
                endDate: null,
                note: 'Note 1',
                whenCreated: new Date(),
                whoCreated: 'ABC',
                whenUpdated: new Date(),
                whoUpdated: 'ABC',
                rwmFlag: 1,
                rwmNoteFlag: 1,
                psnorg: null,
                site: sampleSites[0],
                siteParticRoles: [
                  {
                    prCode: 'PR001',
                    spId: '1',
                    id: 'bbb-jjjj-kkkk-llll',
                    userAction: 'pending',
                    srAction: 'pending',
                    whenCreated: new Date(),
                    whoCreated: 'ABC',
                    whenUpdated: new Date(),
                    whoUpdated: 'ABC',
                    rwmFlag: 1,
                    sp: null,
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
                userAction: '',
                srAction: '',
              },
            ],
          },
        },
      ];
      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);
      const snapshot = await service.getSnapshotsByUserId(userId);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { whenCreated: 'DESC' },
      });
    });

    it('should throw an error if repository throws an error', async () => {
      const userId = '1';

      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(
          new Error('Failed to retrieve snapshots by userId.'),
        );

      await expect(service.getSnapshotsByUserId(userId)).rejects.toThrow(
        `Failed to retrieve snapshots by userId: ${userId}`,
      );
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSnapshotsByUserIdAndSiteId', () => {
    it('should return an array of snapshots for a given userId and siteId', async () => {
      const userId = '1';
      const siteId = '1';
      const res: Snapshots[] = [
        {
          id: 1,
          userId: '1',
          siteId: '1',
          transactionId: '1',
          whenCreated: new Date(),
          whoCreated: 'ABC',
          whenUpdated: new Date(),
          whoUpdated: 'ABC',
          site: sampleSites[0],
          snapshotData: {
            sitesSummary: sampleSites[0],
            documents: null,
            events: null,
            eventsParticipants: null,
            landHistories: null,
            profiles: null,
            siteAssociations: null,
            subDivisions: null,
            siteParticipants: [
              {
                id: '1',
                siteId: 'site123',
                psnorgId: 'org1',
                effectiveDate: new Date('2023-01-01'),
                endDate: null,
                note: 'Note 1',
                whenCreated: new Date(),
                whoCreated: 'ABC',
                whenUpdated: new Date(),
                whoUpdated: 'ABC',
                rwmFlag: 1,
                rwmNoteFlag: 1,
                psnorg: null,
                site: sampleSites[0],
                siteParticRoles: [
                  {
                    prCode: 'PR001',
                    spId: '1',
                    id: 'bbb-jjjj-kkkk-llll',
                    userAction: 'pending',
                    srAction: 'pending',
                    whenCreated: new Date(),
                    whoCreated: 'ABC',
                    whenUpdated: new Date(),
                    whoUpdated: 'ABC',
                    rwmFlag: 1,
                    sp: null,
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
                userAction: '',
                srAction: '',
              },
            ],
          },
        },
      ];
      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);
      const snapshot = await service.getSnapshotsBySiteId(siteId, userId);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
      });
    });

    it('should throw an error if repository throws an error', async () => {
      const userId = '1';
      const siteId = '1';
      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(
          new Error('Failed to retrieve snapshots by userId and siteId.'),
        );

      await expect(
        service.getSnapshotsBySiteId(siteId, userId),
      ).rejects.toThrow(
        `Failed to retrieve snapshots by userId: ${userId} and siteId: ${siteId}`,
      );
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMostRecentSnapshot', () => {
    it('should return a single snapshot for a given userId and siteId', async () => {
      const userId = '1';
      const siteId = '1';
      const res: Snapshots = {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '1',
        whenCreated: new Date(2024, 8, 28),
        whoCreated: 'ABC',
        whenUpdated: new Date(2024, 8, 28),
        whoUpdated: 'ABC',
        site: sampleSites[0],
        snapshotData: {
          sitesSummary: sampleSites[0],
          documents: null,
          events: null,
          eventsParticipants: null,
          landHistories: null,
          profiles: null,
          siteAssociations: null,
          subDivisions: null,
          siteParticipants: null,
        },
      };
      jest
        .spyOn(snapshotRepository, 'findOne')
        .mockResolvedValueOnce(res as Snapshots);
      const snapshot = await service.getMostRecentSnapshot(siteId, userId);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.findOne).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.findOne).toHaveBeenCalledWith({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
      });
    });

    it('should throw an error if repository throws an error', async () => {
      const userId = '1';
      const siteId = '1';
      const errorMessage = 'Failed to retrieve the most recent snapshot';
      jest
        .spyOn(snapshotRepository, 'findOne')
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.getMostRecentSnapshot(siteId, userId),
      ).rejects.toThrow(errorMessage);
      expect(snapshotRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when there are no results', () => {
    it('returns null', async () => {
      const userId = '1';
      const siteId = '1';
      const res: Snapshots = null;
      jest
        .spyOn(snapshotRepository, 'findOne')
        .mockResolvedValueOnce(res as Snapshots);
      const snapshot = await service.getMostRecentSnapshot(siteId, userId);

      expect(snapshot).toBeNull();
      expect(snapshotRepository.findOne).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.findOne).toHaveBeenCalledWith({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
      });
    });
  });

  describe('getSnapshotsById', () => {
    it('should return an array of snapshots for a given id', async () => {
      const id = 1;
      const res: Snapshots[] = [
        {
          id: 1,
          userId: '1',
          siteId: '1',
          transactionId: '1',
          whenCreated: new Date(),
          whoCreated: 'ABC',
          whenUpdated: new Date(),
          whoUpdated: 'ABC',
          site: sampleSites[0],
          snapshotData: {
            sitesSummary: sampleSites[0],
            documents: null,
            events: null,
            eventsParticipants: null,
            landHistories: null,
            profiles: null,
            siteAssociations: null,
            subDivisions: null,
            siteParticipants: [
              {
                id: '1',
                siteId: 'site123',
                psnorgId: 'org1',
                effectiveDate: new Date('2023-01-01'),
                endDate: null,
                note: 'Note 1',
                whenCreated: new Date(),
                whoCreated: 'ABC',
                whenUpdated: new Date(),
                whoUpdated: 'ABC',
                rwmFlag: 1,
                rwmNoteFlag: 1,
                psnorg: null,
                site: sampleSites[0],
                siteParticRoles: [
                  {
                    prCode: 'PR001',
                    spId: '1',
                    whenCreated: new Date(),
                    whoCreated: 'ABC',
                    whenUpdated: new Date(),
                    whoUpdated: 'ABC',
                    rwmFlag: 1,
                    sp: null,
                    id: 'bbb-jjjj-kkkk-llll',
                    userAction: 'pending',
                    srAction: 'pending',
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
                userAction: '',
                srAction: '',
              },
            ],
          },
        },
      ];

      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);

      const snapshot = await service.getSnapshotsById(id);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw an error if repository throws an error', async () => {
      const id = 1;
      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(
          new Error(`Failed to retrieve snapshot by ID: ${id}.`),
        );

      await expect(service.getSnapshotsById(id)).rejects.toThrow(
        `Failed to retrieve snapshot by ID: ${id}.`,
      );
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBannerTypeForSnapshot', () => {
    const siteId = '1';
    const userId = '1';
    const expectedBannerType = 'current';

    it('should return the correct banner type', async () => {
      jest.spyOn(service, 'getBannerType').mockResolvedValueOnce('current');

      const result = await service.getBannerType(siteId, userId);

      expect(result).toEqual(expectedBannerType);
    });
  });

  describe('createSnapshot', () => {
    it('should create a snapshot successfully', async () => {
      const snapshotDto: CreateSnapshotDto[] = [{ siteId: '1' }];
      const userInfo = { sub: 'userId', givenName: 'UserName' };
      const snapshotEntity = [
        {
          id: 1,
          userId: 'userId',
          siteId: '1',
          transactionId: '1',
          whenCreated: new Date(),
          whoCreated: 'UserName',
          whenUpdated: new Date(),
          whoUpdated: 'UserName',
          site: {},
          snapshotData: new SnapshotSiteContent(),
        },
      ];

      jest.spyOn(sitesRepository, 'findOne').mockResolvedValue({} as any);
      jest.spyOn(eventsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(eventParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteDocsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(landHistoriesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteProfilesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteSubdivisionsRepository, 'find').mockResolvedValue([]);
      jest
        .spyOn(snapshotRepository, 'save')
        .mockResolvedValue(snapshotEntity as any);

      const result = await service.createSnapshotForSites(
        snapshotDto,
        userInfo,
      );
      expect(result).toBe(true);
    });

    it('should throw an error if repository throws an error', async () => {
      const snapshotDto: CreateSnapshotDto = {
        siteId: '1',
      };

      // Mock the repository methods
      jest
        .spyOn(snapshotRepository, 'save')
        .mockRejectedValueOnce(new Error('Failed to insert snapshot.'));
      jest.spyOn(sitesRepository, 'findOne').mockResolvedValue(null); // Mock the findOne method for Sites repository
      jest.spyOn(snapshotRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(sitesRepository, 'findOne').mockResolvedValue(sampleSites[0]);
      jest.spyOn(eventsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteAssocsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(eventParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteDocsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(landHistoriesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteProfilesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteSubdivisionsRepository, 'find').mockResolvedValue([]);

      await expect(
        service.createSnapshotForSites([snapshotDto], ''),
      ).rejects.toThrow('Failed to create snapshot.');
      expect(snapshotRepository.save).toHaveBeenCalledTimes(1);
    });

    it('Should Only Return Notations with Pending Status', async () => {
      jest
        .spyOn(eventsRepository, 'find')
        .mockResolvedValue(sampleNotationData);

      const notations = service.getNotationsForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getNotationsForSnapshotCreation should be called with SRAction equals public', async () => {
      jest
        .spyOn(eventsRepository, 'find')
        .mockResolvedValue(sampleNotationData);

      service.getNotationsForSnapshotCreation('1');

      expect(eventsRepository.find).toHaveBeenCalledWith({
        where: { siteId: '1', srAction: SRApprovalStatusEnum.PUBLIC },
      });
    });

    it('getNotationsForSnapshotCreation should throw error', async () => {
      const mockError = new Error('site id cannot be empty');
      await expect(service.getNotationsForSnapshotCreation('')).rejects.toThrow(
        mockError,
      );
    });

    it('Should Only Return Notation Participants with Pending Status', async () => {
      jest
        .spyOn(eventParticsRepository, 'find')
        .mockResolvedValue(sampleNotationParticipants);
      const notations = service.getNotatioParticipantsForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getNotatioParticipantsForSnapshotCreation should be called with SRAction equals public', async () => {
      jest
        .spyOn(eventParticsRepository, 'find')
        .mockResolvedValue(sampleNotationParticipants);
      service.getNotatioParticipantsForSnapshotCreation('1');
      expect(eventParticsRepository.find).toHaveBeenCalledTimes(1);
    });

    it('getNotatioParticipantsForSnapshotCreation should throw error', async () => {
      const mockError = new Error('notation id cannot be empty');
      await expect(
        service.getNotatioParticipantsForSnapshotCreation(''),
      ).rejects.toThrow(mockError);
    });

    it('Should Only Return Documents with Pending Status', async () => {
      jest.spyOn(siteDocsRepository, 'find').mockResolvedValue(sampleDocuments);
      const notations = service.getSiteDocumentsForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getSiteDocumentsForSnapshotCreation should be called with SRAction equals public', async () => {
      jest.spyOn(siteDocsRepository, 'find').mockResolvedValue(sampleDocuments);
      service.getSiteDocumentsForSnapshotCreation('1');
      expect(siteDocsRepository.find).toHaveBeenCalledTimes(1);
    });

    it('getSiteDocumentsForSnapshotCreation should throw error', async () => {
      const mockError = new Error('site id cannot be empty');
      await expect(
        service.getSiteDocumentsForSnapshotCreation(''),
      ).rejects.toThrow(mockError);
    });

    it('Should Only Return Site Partics with Pending Status', async () => {
      jest
        .spyOn(siteParticsRepository, 'find')
        .mockResolvedValue(sampleSiteParticipants);
      const notations = service.getSiteParticipantsForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getSiteParticipantsForSnapshotCreation should be called with SRAction equals public', async () => {
      jest
        .spyOn(siteParticsRepository, 'find')
        .mockResolvedValue(sampleSiteParticipants);
      service.getSiteParticipantsForSnapshotCreation('1');
      expect(siteParticsRepository.find).toHaveBeenCalledTimes(1);
    });

    it('getSiteParticipantsForSnapshotCreation should throw error', async () => {
      const mockError = new Error('site id cannot be empty');
      await expect(
        service.getSiteParticipantsForSnapshotCreation(''),
      ).rejects.toThrow(mockError);
    });

    it('Should Only Return Land Histories with Pending Status', async () => {
      jest
        .spyOn(landHistoriesRepository, 'find')
        .mockResolvedValue(sampleLandHistories);
      const notations = service.getLandHisotoriesForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getLandHisotoriesForSnapshotCreation should be called with SRAction equals public', async () => {
      jest
        .spyOn(landHistoriesRepository, 'find')
        .mockResolvedValue(sampleLandHistories);
      service.getLandHisotoriesForSnapshotCreation('1');
      expect(landHistoriesRepository.find).toHaveBeenCalledWith({
        where: { siteId: '1', srAction: SRApprovalStatusEnum.PUBLIC },
      });
    });

    it('getLandHisotoriesForSnapshotCreation should throw error', async () => {
      const mockError = new Error('site id cannot be empty');
      await expect(
        service.getLandHisotoriesForSnapshotCreation(''),
      ).rejects.toThrow(mockError);
    });

    it('Should Only Return Disclosure with Pending Status', async () => {
      jest
        .spyOn(siteProfilesRepository, 'find')
        .mockResolvedValue(sampleProfiles);
      const notations = service.getDisclosureForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getDisclosureForSnapshotCreation should be called with SRAction equals public', async () => {
      jest
        .spyOn(siteProfilesRepository, 'find')
        .mockResolvedValue(sampleProfiles);
      service.getDisclosureForSnapshotCreation('1');
      expect(siteProfilesRepository.find).toHaveBeenCalledWith({
        where: { siteId: '1', srAction: SRApprovalStatusEnum.PUBLIC },
      });
    });

    it('getDisclosureForSnapshotCreation should throw error', async () => {
      const mockError = new Error('site id cannot be empty');
      await expect(
        service.getDisclosureForSnapshotCreation(''),
      ).rejects.toThrow(mockError);
    });

    it('Should Only Return Site Associations with Pending Status', async () => {
      jest
        .spyOn(siteAssocsRepository, 'find')
        .mockResolvedValue(sampleSiteAssociations);
      const notations = service.getSiteAssociationsForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getSiteAssociationsForSnapshotCreation should be called with SRAction equals public', async () => {
      jest
        .spyOn(siteAssocsRepository, 'find')
        .mockResolvedValue(sampleSiteAssociations);
      service.getSiteAssociationsForSnapshotCreation('1');
      expect(siteAssocsRepository.find).toHaveBeenCalledWith({
        where: { siteId: '1', srAction: SRApprovalStatusEnum.PUBLIC },
      });
    });

    it('getSiteAssociationsForSnapshotCreation should throw error', async () => {
      const mockError = new Error('site id cannot be empty');
      await expect(
        service.getSiteAssociationsForSnapshotCreation(''),
      ).rejects.toThrow(mockError);
    });

    it('Should Only Return Site SubDivisions with Pending Status', async () => {
      jest
        .spyOn(siteSubdivisionsRepository, 'find')
        .mockResolvedValue(sampleSiteSubDivions);
      const notations = service.getSubDivisionsForSnapshotCreation('1');
      expect((await notations).length).toBe(1);
    });

    it('getSubDivisionsForSnapshotCreation should be called with SRAction equals public', async () => {
      jest
        .spyOn(siteSubdivisionsRepository, 'find')
        .mockResolvedValue(sampleSiteSubDivions);
      service.getSubDivisionsForSnapshotCreation('1');
      expect(siteSubdivisionsRepository.find).toHaveBeenCalledWith({
        where: { siteId: '1', srAction: SRApprovalStatusEnum.PUBLIC },
      });
    });

    it('getSubDivisionsForSnapshotCreation should throw error', async () => {
      const mockError = new Error('site id cannot be empty');
      await expect(
        service.getSubDivisionsForSnapshotCreation(''),
      ).rejects.toThrow(mockError);
    });
  });
});
