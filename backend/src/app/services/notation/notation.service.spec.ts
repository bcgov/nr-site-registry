// Import necessary modules for testing
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotationService } from './notation.service';
import { Events } from '../../entities/events.entity';
import { EventPartics } from '../../entities/eventPartics.entity';
import { LoggerService } from '../../logger/logger.service';
import { UserTypeEum } from '../../common/userType';
import { SnapshotsService } from '../snapshot/snapshot.service';

jest.mock('../snapshot/snapshot.service');
describe('NotationService', () => {
  let service: NotationService;
  let snapshotService: SnapshotsService;
  let notationRepository: Repository<Events>;
  let notationParticRepository: Repository<EventPartics>;
  let sitesLogger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotationService,
        LoggerService,
        SnapshotsService,
        {
          provide: getRepositoryToken(Events),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EventPartics),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotationService>(NotationService);
    snapshotService = module.get<SnapshotsService>(SnapshotsService);
    sitesLogger = module.get<LoggerService>(LoggerService);
    notationRepository = module.get<Repository<Events>>(
      getRepositoryToken(Events),
    );
    notationParticRepository = module.get<Repository<EventPartics>>(
      getRepositoryToken(EventPartics),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSiteNotationBySiteId', () => {
    it('should return transformed notations when siteId exists', async () => {
      const siteId = 'site1';
      const mockEvents: Events[] = [
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
          whoDeleted: null,
          whenDeleted: null,
          whoRestored: null,
          whenRestored: null,
          eventPartics: [
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
          ],
        },
      ];
      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce(mockEvents);
      jest
        .spyOn(notationParticRepository, 'find')
        .mockResolvedValueOnce(mockEvents[0].eventPartics);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      const result = await service.getSiteNotationBySiteId(siteId, false, user);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0].id).toEqual(mockEvents[0].id);
      expect(result[0].siteId).toEqual(mockEvents[0].siteId);
      expect(result[0].notationParticipant).toHaveLength(1);
      expect(result[0].notationParticipant[0].eventParticId).toEqual(
        mockEvents[0].eventPartics[0].id,
      );
    });

    it('should return empty array when siteId does not exist', async () => {
      const siteId = 'nonExistentSite';
      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce([]);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      const result = await service.getSiteNotationBySiteId(siteId, false, user);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });

    it('should throw an error when repository throws an error', async () => {
      const siteId = 'site1';
      const mockError = new Error(
        `Failed to retrieve site notations by site ID: ${siteId}`,
      );
      jest.spyOn(notationRepository, 'find').mockRejectedValueOnce(mockError);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      await expect(
        service.getSiteNotationBySiteId(siteId, false, user),
      ).rejects.toThrow(mockError);
    });

    it('should return transformed notations for multiple events', async () => {
      const siteId = 'site1';
      const mockEvents: Events[] = [
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
          whoDeleted: null,
          whenDeleted: null,
          whoRestored: null,
          whenRestored: null,
          eventPartics: [
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
          ],
        },
        {
          id: '2',
          siteId: 'site1',
          eventDate: new Date(),
          completionDate: new Date(),
          etypCode: 'ETYP02',
          psnorgId: 'PSNORG02',
          spId: 'SP02',
          requiredAction: 'Complete task Y',
          note: 'Another note about the event.',
          regionAppFlag: 'Y',
          regionUserid: 'user456',
          regionDate: new Date(),
          whoCreated: 'creator456',
          whoUpdated: null,
          whenCreated: new Date(),
          whenUpdated: null,
          rwmFlag: 1,
          rwmNoteFlag: 0,
          rwmApprovalDate: new Date(),
          eclsCode: 'ECLS02',
          requirementDueDate: new Date(),
          requirementReceivedDate: new Date(),
          conditionsTexts: null,
          eventTypeCd: null,
          site: null,
          userAction: 'pending',
          srAction: 'pending',
          whoDeleted: null,
          whenDeleted: null,
          whoRestored: null,
          whenRestored: null,
          eventPartics: [],
        },
      ];
      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce(mockEvents);
      jest
        .spyOn(notationParticRepository, 'find')
        .mockResolvedValueOnce(mockEvents[0].eventPartics);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      const result = await service.getSiteNotationBySiteId(siteId, false, user);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(2); // Ensure both events are returned
      expect(result[0].id).toEqual(mockEvents[0].id);
      expect(result[1].id).toEqual('2');
    });

    it('should return empty array when no events are found for siteId', async () => {
      const siteId = 'site_without_events';
      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce([]);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      const result = await service.getSiteNotationBySiteId(siteId, false, user);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(0);
    });

    it('should transform and validate event data correctly', async () => {
      const siteId = '1';
      const mockEvents: Events[] = [
        {
          id: '1',
          siteId: '1',
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
          whoDeleted: null,
          whenDeleted: null,
          whoRestored: null,
          whenRestored: null,
          eventPartics: [
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
          ],
        },
      ];
      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce(mockEvents);
      jest
        .spyOn(notationParticRepository, 'find')
        .mockResolvedValueOnce(mockEvents[0].eventPartics);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      const result = await service.getSiteNotationBySiteId(siteId, false, user);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBeTruthy();
      expect(result.length).toBe(1);

      // Validate individual fields
      expect(result[0].id).toEqual(mockEvents[0].id);
      expect(result[0].siteId).toEqual(mockEvents[0].siteId);
      expect(result[0].notationParticipant).toHaveLength(1);
      expect(result[0].notationParticipant[0].eventParticId).toEqual(
        mockEvents[0].eventPartics[0].id,
      );
    });

    it('should throw an error when repository throws an error', async () => {
      const siteId = 'site1';
      const mockError = new Error(
        `Failed to retrieve site notations by site ID: ${siteId}`,
      );
      jest.spyOn(notationRepository, 'find').mockRejectedValueOnce(mockError);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      await expect(
        service.getSiteNotationBySiteId(siteId, false, user),
      ).rejects.toThrow(mockError);
    });

    it('should default includeDeleted to false when parameter is omitted', async () => {
      const siteId = 'site1';
      const user = { identity_provider: UserTypeEum.IDIR };

      const mockEvents: Events[] = [
        {
          id: '1',
          siteId: siteId,
          eventDate: new Date(),
          completionDate: new Date(),
          etypCode: 'ETYP01',
          psnorgId: 'PSNORG01',
          spId: 'SP01',
          requiredAction: 'Complete task',
          note: 'Test note',
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
          whoDeleted: null,
          whenDeleted: null,
          whoRestored: null,
          whenRestored: null,
          eventPartics: [],
        },
      ];

      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce(mockEvents);
      jest.spyOn(notationParticRepository, 'find').mockResolvedValueOnce([]);

      await service.getSiteNotationBySiteId(siteId, false, user);

      expect(notationRepository.find).toHaveBeenCalledWith({
        where: { siteId, whenDeleted: null },
      });
    });

    it('should return both deleted and undeleted notations when includeDeleted is true', async () => {
      const siteId = 'site1';
      const user = { identity_provider: UserTypeEum.IDIR };

      const mockEvents: Events[] = [
        {
          id: '1',
          siteId: siteId,
          eventDate: new Date(),
          completionDate: new Date(),
          etypCode: 'ETYP01',
          psnorgId: 'PSNORG01',
          spId: 'SP01',
          requiredAction: 'Complete task',
          note: 'Test note',
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
          whoDeleted: 'user123',
          whenDeleted: new Date(),
          whoRestored: null,
          whenRestored: null,
          eventPartics: [],
        },
        {
          id: '2',
          siteId: siteId,
          eventDate: new Date(),
          completionDate: new Date(),
          etypCode: 'ETYP02',
          psnorgId: 'PSNORG02',
          spId: 'SP02',
          requiredAction: 'Complete second task',
          note: 'Second test note',
          regionAppFlag: 'Y',
          regionUserid: 'user456',
          regionDate: new Date(),
          whoCreated: 'creator456',
          whoUpdated: null,
          whenCreated: new Date(),
          whenUpdated: null,
          rwmFlag: 1,
          rwmNoteFlag: 0,
          rwmApprovalDate: new Date(),
          eclsCode: 'ECLS02',
          requirementDueDate: new Date(),
          requirementReceivedDate: new Date(),
          conditionsTexts: null,
          eventTypeCd: null,
          site: null,
          userAction: 'pending',
          srAction: 'pending',
          whoDeleted: null,
          whenDeleted: null,
          whoRestored: null,
          whenRestored: null,
          eventPartics: [],
        },
      ];

      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce(mockEvents);
      jest.spyOn(notationParticRepository, 'find').mockResolvedValueOnce([]);

      const result = await service.getSiteNotationBySiteId(
        siteId,
        false,
        user,
        true,
      );

      expect(notationRepository.find).toHaveBeenCalledWith({
        where: { siteId },
      });
      expect(result).toHaveLength(2);
      expect(result.map((notation) => notation.id)).toEqual(
        expect.arrayContaining(['1', '2']),
      );
    });

    it('should return notations with pending srAction when showPending is true', async () => {
      const siteId = 'site1';
      const user = { identity_provider: UserTypeEum.IDIR };

      const mockEvents: Events[] = [
        {
          id: '1',
          siteId: siteId,
          eventDate: new Date(),
          completionDate: new Date(),
          etypCode: 'ETYP01',
          psnorgId: 'PSNORG01',
          spId: 'SP01',
          requiredAction: 'Complete task',
          note: 'Test note',
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
          whoDeleted: null,
          whenDeleted: null,
          whoRestored: null,
          whenRestored: null,
          eventPartics: [],
        },
      ];

      jest.spyOn(notationRepository, 'find').mockResolvedValueOnce(mockEvents);
      jest.spyOn(notationParticRepository, 'find').mockResolvedValueOnce([]);

      await service.getSiteNotationBySiteId(siteId, true, user, false);

      expect(notationRepository.find).toHaveBeenCalledWith({
        where: { siteId, srAction: 'pending', whenDeleted: null },
      });
    });
  });
});
