import { Test, TestingModule } from '@nestjs/testing';
import { DropdownService } from './dropdown.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ParticRoleCd } from '../../entities/particRoleCd.entity';
import { PeopleOrgs } from '../../entities/peopleOrgs.entity';
import { EventClassCd } from '../../entities/eventClassCd.entity';
import { EventTypeCd } from '../../entities/eventTypeCd.entity';
import { EventParticRoleCd } from '../../entities/eventParticRoleCd.entity';
import { LoggerService } from '../../logger/logger.service';
import { User } from '../../entities/user.entity';

// Mock particRoleCd and peopleOrgs entities and their methods
jest.mock('../../entities/particRoleCd.entity');
jest.mock('../../entities/peopleOrgs.entity');

describe('DropdownService', () => {
  let service: DropdownService;
  let particRoleRepository: Repository<ParticRoleCd>;
  let peopleOrgsRepository: Repository<PeopleOrgs>;
  let eventClassCdRepository: Repository<EventClassCd>;
  let eventTypeCdRepository: Repository<EventTypeCd>;
  let eventParticRoleCdRepository: Repository<EventParticRoleCd>;
  let sitesLogger: LoggerService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DropdownService,
        LoggerService,
        {
          provide: getRepositoryToken(ParticRoleCd),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PeopleOrgs),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EventClassCd),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EventTypeCd),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EventParticRoleCd),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DropdownService>(DropdownService);
    sitesLogger = module.get<LoggerService>(LoggerService);
    particRoleRepository = module.get<Repository<ParticRoleCd>>(
      getRepositoryToken(ParticRoleCd),
    );
    peopleOrgsRepository = module.get<Repository<PeopleOrgs>>(
      getRepositoryToken(PeopleOrgs),
    );
    eventClassCdRepository = module.get<Repository<EventClassCd>>(
      getRepositoryToken(EventClassCd),
    );
    eventTypeCdRepository = module.get<Repository<EventTypeCd>>(
      getRepositoryToken(EventTypeCd),
    );
    eventParticRoleCdRepository = module.get<Repository<EventParticRoleCd>>(
      getRepositoryToken(EventParticRoleCd),
    );

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for getParticipantRoleCd method
  describe('getParticipantRoleCd', () => {
    it('should return participant role codes', async () => {
      const expectedRoles = [
        { code: 'role1', description: 'Role 1' },
        { code: 'role2', description: 'Role 2' },
      ];
      jest
        .spyOn(particRoleRepository, 'find')
        .mockResolvedValueOnce(expectedRoles as ParticRoleCd[]);

      const result = await service.getParticipantRoleCd();

      expect(result).toEqual(
        expectedRoles.map((role) => ({
          key: role.code,
          value: role.description,
        })),
      );
      expect(particRoleRepository.find).toHaveBeenCalled();
    });

    it('should throw an error when repository find fails', async () => {
      const error = new Error('Database connection error');
      jest.spyOn(particRoleRepository, 'find').mockRejectedValueOnce(error);

      await expect(service.getParticipantRoleCd()).rejects.toThrowError(
        'Failed to retrieve participants role code.',
      );
    });
  });

  // Test case for getPeopleOrgsCd method
  describe('getPeopleOrgsCd', () => {
    it('should return people organizations', async () => {
      const expectedOrgs = [
        { id: 'org1', displayName: 'Organization 1' },
        { id: 'org2', displayName: 'Organization 2' },
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(expectedOrgs),
      } as unknown as SelectQueryBuilder<PeopleOrgs>;

      jest
        .spyOn(peopleOrgsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      const result = await service.getPeopleOrgsCd('org', '');

      expect(result).toEqual(
        expectedOrgs.map((org) => ({ key: org.id, value: org.displayName })),
      );
      expect(peopleOrgsRepository.createQueryBuilder).toHaveBeenCalledWith(
        'people_orgs',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should throw an error when query fails', async () => {
      const error = new Error('Database connection error');
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValueOnce(error),
      } as unknown as SelectQueryBuilder<PeopleOrgs>;

      jest
        .spyOn(peopleOrgsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder);

      await expect(service.getPeopleOrgsCd('', '')).rejects.toThrowError(
        'Failed to retrieve people orgs.',
      );
    });
  });
});
