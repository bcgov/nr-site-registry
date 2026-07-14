import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { access, readFile } from 'fs/promises';
import * as request from 'supertest';
import { LTSAController } from '../src/app/controller/ltsa.controller';
import { CustomExceptionFilter } from '../src/app/filters/customExceptionFilters';
import { LoggerService } from '../src/app/logger/logger.service';
import { LTSAService, LtsaUpload } from '../src/app/services/ltsa/ltsa.service';

class TestBearerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const authorization = context.switchToHttp().getRequest()
      .headers.authorization;
    if (authorization !== 'Bearer test-token') {
      throw new UnauthorizedException('Bearer token required');
    }
    return true;
  }
}

describe('LTSA HTTP contract', () => {
  let app: INestApplication;
  const service = {
    processDump: jest.fn(),
    getStatus: jest.fn(),
    processFile: jest.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LTSAController],
      providers: [
        { provide: LTSAService, useValue: service },
        {
          provide: LoggerService,
          useValue: { error: jest.fn(), warn: jest.fn() },
        },
        { provide: APP_GUARD, useClass: TestBearerGuard },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new CustomExceptionFilter());
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => jest.clearAllMocks());

  it('requires authentication for operational status', async () => {
    await request(app.getHttpServer()).get('/ltsa/status').expect(401);
  });

  it('returns authenticated operational status', async () => {
    service.getStatus.mockResolvedValue({
      status: 'success',
      operations: { load: { latestRun: null, lastSuccessfulRun: null } },
    });

    await request(app.getHttpServer())
      .get('/ltsa/status')
      .set('Authorization', 'Bearer test-token')
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('success');
        expect(body.operations.load).toBeDefined();
      });
  });

  it('accepts an authenticated multipart load and cleans its temp file', async () => {
    let temporaryPath = '';
    service.processFile.mockImplementation(async (file: LtsaUpload) => {
      temporaryPath = file.path;
      await access(temporaryPath);
      expect(await readFile(temporaryPath, 'utf8')).toContain('000000001A');
      return {
        status: 'success',
        outcome: 'success',
        runId: '1',
        timestamp: new Date().toISOString(),
        filename: file.originalname,
        fileHash: 'sha256:test',
        size: file.size,
        duplicate: false,
        recordsProcessed: 1,
        recordsLoaded: 1,
        recordsSkipped: 0,
        malformedRecords: 0,
        changedRecords: 1,
        warnings: [],
        mergeResults: {
          recordsProcessed: 1,
          subdivisionUpdates: 1,
          subdivisionInserts: 0,
          siteSubdivisionInserts: 0,
        },
      };
    });

    await request(app.getHttpServer())
      .post('/ltsa/load')
      .set('Authorization', 'Bearer test-token')
      .attach('file', Buffer.from('000000001ALEGAL DESCRIPTION\n'), {
        filename: 'PARCEL_DESCRIPTION_RESPONSE_TEST.TXT',
        contentType: 'text/plain',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            status: 'success',
            outcome: 'success',
            recordsLoaded: 1,
          }),
        );
      });

    await expect(access(temporaryPath)).rejects.toThrow();
  });
});
