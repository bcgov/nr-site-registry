import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LoggerService } from '../../logger/logger.service';

describe('UserService', () => {
  let userService: UserService;
  let usersRepository: Repository<User>;
  let loggerService: LoggerService;

  const user: User = {
    firstName: 'john',
    lastName: 'daniel',
    userId: '12312312312312123',
    idp: 'bceid',
    email: 'asfsafd@safdas.com',
    whoCreated: 'admin',
    whenCreated: new Date(),
    id: 0,
    whoUpdated: 'admin',
    whenUpdated: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        LoggerService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);

    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('User Service Should Be Defined', () => {
    expect(userService).toBeDefined();
  });

  it('createUserIfNotFound should create user', async () => {
    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(usersRepository, 'create').mockReturnValue(user);
    jest.spyOn(usersRepository, 'save').mockResolvedValue(user);

    await userService.createUserIfNotFound(
      'asfsafd@safdas.com',
      '1',
      'bceid',
      'john',
      'daniel',
    );
  });
});
