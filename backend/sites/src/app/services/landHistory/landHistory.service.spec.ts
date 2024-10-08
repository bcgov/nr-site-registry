import { Test } from '@nestjs/testing';
import { LandHistoryService } from './landHistory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LandHistories } from '../../entities/landHistories.entity';
import { In } from 'typeorm';
import { LandHistoriesInputDTO } from '../../dto/landHistoriesInput.dto';
import { TransactionManagerService } from '../transactionManager/transactionManager.service';
import { REQUEST } from '@nestjs/core';

describe('LandHistoryService', () => {
  let landHistoryService: LandHistoryService;

  let entityManagerMock: {
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  const mockUser = { name: 'mock user' };
  const whereMock = jest.fn().mockReturnThis();

  beforeEach(async () => {
    entityManagerMock = {
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        LandHistoryService,
        {
          provide: getRepositoryToken(LandHistories),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              where: whereMock,
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockReturnValue([]),
              andWhere: jest.fn().mockReturnThis(),
            })),
          },
        },
        {
          provide: TransactionManagerService,
          useValue: {
            getEntityManager: jest.fn(() => ({
              transaction: jest.fn((transactionCallback) => {
                transactionCallback(entityManagerMock);
              }),
            })),
          },
        },
        {
          provide: REQUEST,
          useValue: { req: { user: mockUser } },
        },
      ],
    }).compile();

    landHistoryService = moduleRef.get<LandHistoryService>(LandHistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(landHistoryService).toBeDefined();
  });

  describe('getLandHistoriesForSite', () => {
    it('should call LandHistories repository with correct data', async () => {
      const siteId = 'site123';
      await landHistoryService.getLandHistoriesForSite(siteId, '', 'ASC');

      expect(whereMock).toHaveBeenCalledWith('site_id = :siteId', {
        siteId,
      });
    });
  });

  describe('updateLandHistoriesForSite', () => {
    it('should handle additions', async () => {
      const siteId = 'site123';
      const landUseCode = 'newCode';
      const note = 'New note';
      const landHistoriesInput: LandHistoriesInputDTO[] = [
        {
          landUseCode,
          note,
          shouldDelete: false,
          originalLandUseCode: null,
          srAction: '',
          userAction: '',
          apiAction: '',
        },
      ];

      await landHistoryService.updateLandHistoriesForSite(
        siteId,
        landHistoriesInput,
        mockUser,
      );

      expect(entityManagerMock.save).toHaveBeenCalledWith(
        LandHistories,
        expect.arrayContaining([
          expect.objectContaining({
            lutCode: landUseCode,
            note,
            siteId,
            whoCreated: mockUser.name,
            whenCreated: expect.any(Date),
          }),
        ]),
      );
    });

    it('should handle updates', async () => {
      const siteId = 'site123';
      const landUseCode = 'updatedCode';
      const note = 'Updated note';
      const originalLandUseCode = 'originalCode';
      const landHistoriesInput: LandHistoriesInputDTO[] = [
        {
          landUseCode,
          note,
          shouldDelete: false,
          originalLandUseCode,
          srAction: '',
          userAction: '',
          apiAction: '',
        },
      ];

      await landHistoryService.updateLandHistoriesForSite(
        siteId,
        landHistoriesInput,
        mockUser,
      );

      expect(entityManagerMock.update).toHaveBeenCalledWith(
        LandHistories,
        { lutCode: originalLandUseCode, siteId },
        expect.objectContaining({
          lutCode: landUseCode,
          note,
          whoUpdated: mockUser.name,
          whenUpdated: expect.any(Date),
        }),
      );
    });

    it('should handle deletes', async () => {
      const siteId = 'site123';
      const originalLandUseCode = 'originalCode';
      const landHistoriesInput: LandHistoriesInputDTO[] = [
        {
          landUseCode: null,
          note: null,
          shouldDelete: true,
          originalLandUseCode,
          srAction: '',
          userAction: '',
          apiAction: '',
        },
      ];

      await landHistoryService.updateLandHistoriesForSite(
        siteId,
        landHistoriesInput,
        mockUser,
      );

      expect(entityManagerMock.delete).toHaveBeenCalledWith(LandHistories, {
        siteId,
        lutCode: In([originalLandUseCode]),
      });
    });
  });
});
