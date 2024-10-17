import { Repository } from 'typeorm';
import { FolioService } from './folio.service';
import { FolioContentsService } from './folioContents.service';
import { Folio } from '../../entities/folio.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FolioContents } from '../../entities/folioContents.entity';
import { LoggerService } from '../../logger/logger.service';

describe('FolioSerivce', () => {
  let folioSerivce: FolioService;
  let folioContentService: FolioContentsService;
  let folioRepository: Repository<Folio>;
  let folioContentRepository: Repository<FolioContents>;
  let loggerService: LoggerService

  const folios: Folio[] = [
    {
      folioId: '1',
      id: 1,
      userId: '1',
      description: 'test',
      whoCreated: 'test',
      whenCreated: new Date('07-26-2024'),
      whoUpdated: 'test',
      whenUpdated: new Date('07-26-2024'),
      folioContents: null,
    },
  ];

  const folioContent: FolioContents[] = [
    {
      id: '1',
      siteId: '1',
      folioId: '1',
      whoCreated: 'test',
      whenCreated: new Date('07-26-2024'),
      whoUpdated: 'test',
      whenUpdated: new Date('07-26-2024'),
      folio: {
        folioId: '1',
        id: 1,
        userId: '1',
        description: 'test',
        whoCreated: 'test',
        whenCreated: new Date('07-26-2024'),
        whoUpdated: 'test',
        whenUpdated: new Date('07-26-2024'),
        folioContents: null,
      },
      site: null,
    },
  ];

  const user: any = {
    sub: '1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolioService,
        FolioContentsService,
        {
          provide: getRepositoryToken(Folio),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(FolioContents),
          useClass: Repository,
        },
        LoggerService
      ],
    }).compile();

    folioSerivce = module.get<FolioService>(FolioService);

    folioContentService =
      module.get<FolioContentsService>(FolioContentsService);

    folioRepository = module.get<Repository<Folio>>(getRepositoryToken(Folio));

    folioContentRepository = module.get<Repository<FolioContents>>(
      getRepositoryToken(FolioContents),
    );

    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Folio Service should be defined', () => {
    expect(folioSerivce).toBeDefined();
  });

  it('Folio Content Service should be defined', async () => {
    expect(folioContentService).toBeDefined();
  });

  it('Should return folios for current user', async () => {
    jest.spyOn(folioRepository, 'find').mockResolvedValue([
      {
        folioId: '1',
        id: 1,
        userId: '1',
        description: 'test',
        whoCreated: 'test',
        whenCreated: new Date('07-26-2024'),
        whoUpdated: 'test',
        whenUpdated: new Date('07-26-2024'),
        folioContents: null,
      },
    ]);

    const result = await folioSerivce.getFoliosForUser(user);

    expect(result.length).toBeGreaterThan(0);
  });

  it('Should return sites for folio', async () => {
    jest.spyOn(folioRepository, 'findOne').mockResolvedValue(folios[0]);

    jest.spyOn(folioContentRepository, 'find').mockResolvedValue(folioContent);

    const result = await folioSerivce.getSitesForFolio(
      { id: 1, userId: '' },
      user,
    );

    expect(result.length).toBeGreaterThan(0);
  });

  // it('Should Not Add A New Folio', async ()=>{

  //   jest.spyOn(folioRepository, 'findOne').mockResolvedValue(
  //     folios[0]
  //   )
  //   const result = await folioSerivce.addFolio({id:2, userId: "", folioId: "1", description: ""}, user);

  //   expect(result).toBe(false);

  // })

  it('Should Not Add A New Folio', async () => {
    jest.clearAllMocks();

    jest.spyOn(folioRepository, 'findOne').mockResolvedValue(null);

    jest.spyOn(folioRepository, 'save').mockResolvedValue(folios[0]);

    const result = await folioSerivce.addFolio(
      {
        id: 2,
        userId: '',
        folioId: '1',
        description: '',
        whoCreated: 'midhun',
        whenUpdated: '26-07-2024',
      },
      user,
    );

    expect(result).toBe(true);
  });

  it('Should Add A New Folio', async () => {
    jest.spyOn(folioRepository, 'findOne').mockResolvedValue(null);

    jest.spyOn(folioRepository, 'save').mockResolvedValue(folios[0]);

    const result = await folioSerivce.addFolio(
      { id: 2, userId: '', folioId: '1', description: '' },
      user,
    );

    expect(result).toBe(true);
  });

  it('Should Update Folio', async () => {
    jest.spyOn(folioRepository, 'findOne').mockResolvedValue(Folio[0]);

    jest.spyOn(folioRepository, 'save').mockResolvedValue(Folio[0]);

    const result = await folioSerivce.updateFolio(
      [{ id: 2, userId: '', folioId: '1', description: '' }],
      user,
    );

    expect(result).toBe(true);
  });

  it('Should Delete Folio', async () => {
    jest.spyOn(folioRepository, 'findOne').mockResolvedValue(Folio[0]);

    jest.spyOn(folioContentRepository, 'delete').mockResolvedValue({
      affected: 1,
      raw: null,
    });

    jest.spyOn(folioRepository, 'delete').mockResolvedValue({
      affected: 1,
      raw: null,
    });

    jest.spyOn(folioRepository, 'save').mockResolvedValue(Folio[0]);

    const result = await folioSerivce.deleteFolio(2, user);

    expect(result).toBe(true);
  });

  it('Should Add Site To Folio', async () => {
    jest.spyOn(folioRepository, 'findOne').mockResolvedValue(folios[0]);

    jest.spyOn(folioContentRepository, 'findOne').mockResolvedValue(null);

    jest
      .spyOn(folioContentRepository, 'save')
      .mockResolvedValue(folioContent[0]);

    const result = await folioSerivce.addSiteToFolio(
      [{ id: 1, siteId: '5', folioId: '1', userId: '1', whoCreated: '' }],
      user,
    );

    expect(result).toBe(true);
  });
});
