import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { SnapshotDto } from '../../dto/snapshot.dto';
import { Snapshots } from '../../entities/snapshots.entity';
import { Repository } from 'typeorm';
import { validateOrReject } from 'class-validator';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectRepository(Snapshots)
    private snapshotRepository: Repository<Snapshots>,
  ) {}

  async getSnapshots() {
    try {
      const result = await this.snapshotRepository.find();
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve snapshots.');
    }
  }

  async getSnapshotsByUserId(userId: string) {
    try {
      const result = await this.snapshotRepository.find({ where: { userId },
        order: { created: 'DESC' }, });
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve snapshots by userId.');
    }
  }

  async getSnapshotsBySiteId(siteId: string, userId: string) {
    try {
      const result = await this.snapshotRepository.find({ where: {siteId, userId },
        order: { created: 'DESC' }, });
      return result;
    } catch (error) {
      throw new Error('Failed to retrieve snapshots by userId and siteId.');
    }
  }

  async getSnapshotsById(id: number) {
    try {
      const result = await this.snapshotRepository.find({ where: { id } });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async createSnapshot(snapshotDto: SnapshotDto) {
    try {
      await validateOrReject(snapshotDto);
      const snapshot = plainToInstance(Snapshots, snapshotDto);
      const result = await this.snapshotRepository.save(snapshot);
      if (result) {
        return 'Record is inserted successfully.';
      }
    } catch (error) {
      throw new Error('Failed to insert snapshot.');
    }
  }
}
