import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LTSAController } from './ltsa.controller';

describe('LTSAController', () => {
  const service = {
    getSubdivisionsPids: jest.fn(),
    processDump: jest.fn(),
    getStatus: jest.fn(),
    processFile: jest.fn(),
  };
  const logger = { error: jest.fn(), warn: jest.fn() };
  const controller = new LTSAController(service as any, logger as any);

  beforeEach(() => jest.clearAllMocks());

  it('returns stable dump output', async () => {
    service.processDump.mockResolvedValue([{ pidno: '000000001' }]);
    const result = await controller.getDump('1');
    expect(result).toEqual(
      expect.objectContaining({
        status: 'success',
        type: 1,
        count: 1,
        data: ['000000001'],
      }),
    );
    expect(service.processDump).toHaveBeenCalledWith(1);
  });

  it('rejects an invalid dump type as a client error', async () => {
    await expect(controller.getDump('3')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('exposes authenticated status service output', async () => {
    service.getStatus.mockResolvedValue({ status: 'success' });
    await expect(controller.getStatus()).resolves.toEqual({
      status: 'success',
    });
  });

  it('preserves retryable conflict exceptions', async () => {
    service.processFile.mockRejectedValue(new ConflictException('busy'));
    await expect(
      controller.loadLtoData({
        originalname: 'parcel.txt',
        path: '',
        size: 10,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not expose unexpected internal errors', async () => {
    service.processFile.mockRejectedValue(new Error('database password'));
    await expect(
      controller.loadLtoData({
        originalname: 'parcel.txt',
        path: '',
        size: 10,
      }),
    ).rejects.toEqual(
      new InternalServerErrorException('Failed to process LTSA file'),
    );
  });
});
