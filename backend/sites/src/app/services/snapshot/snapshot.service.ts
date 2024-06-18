import { InjectRepository } from "@nestjs/typeorm";
import { Snapshots } from "src/app/entities/snapshots.entity";
import { Repository } from "typeorm";

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

    // async getSna
}