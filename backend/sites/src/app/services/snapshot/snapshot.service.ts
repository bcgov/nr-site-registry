import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { SnapshotDto } from "src/app/dto/snapshot.dto";
import { Snapshots } from "src/app/entities/snapshots.entity";
import { Repository } from "typeorm";

@Injectable()
export class SnapshotsService {
    constructor(
        @InjectRepository(Snapshots)
        private snapshotRepository: Repository<Snapshots>
    ) {}

    async getSnapshots() {
        try
        {
            return await this.snapshotRepository.find();
        }
        catch(error)
        {
            throw error;
        }
    }

    async getSnapshotsByUserId(userId: string) {
        try
        {
            return await this.snapshotRepository.find({where: { userId }})
        }
        catch(error)
        {
            throw error;
        }
    }

    async getSnapshotsById(id: number) {
        try
        {
            return await this.snapshotRepository.find({where: { id }});
        }
        catch(error) 
        {
            throw error;
        }
    }

    async createSnapshot( snapshotDto: SnapshotDto) {

        try
        {
            const snapshot = plainToInstance(Snapshots, snapshotDto);
            const result = await this.snapshotRepository.save(snapshot);
            if(result)
            {
               return 'Record is inserted successfully.' 
            }
        }
        catch(error)
        {
            throw new Error('Failed to insert snapshot.');
        }
    }
}