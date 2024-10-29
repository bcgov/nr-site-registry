import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { RecentViews } from '../../entities/recentViews.entity';
import { RecentViewDto } from '../../dto/recentView.dto';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(RecentViews)
    private recentViewsRepository: Repository<RecentViews>,
    private readonly sitesLogger: LoggerService,
  ) {}

  /**
   * Retrieves recent views for a given user ID.
   *
   * @param userId - The ID of the user whose recent views are to be fetched.
   * @returns An array of RecentViews entities for the specified user.
   * @throws Error if there is an issue retrieving the data.
   */
  async getRecentViewsByUserId(userId: string): Promise<RecentViews[]> {
    this.sitesLogger.log('DashboardService.getRecentViewsByUserId() start');
    this.sitesLogger.debug('DashboardService.getRecentViewsByUserId() start');
    try {
      // Fetch recent views based on the provided userId
      const result = await this.recentViewsRepository.find({
        where: { userId },
      });
      if (result) {
        return result; // Return the fetched recent views
      } else {
        this.sitesLogger.log('DashboardService.getRecentViewsByUserId() end');
        this.sitesLogger.debug('DashboardService.getRecentViewsByUserId() end');
        return []; // Return an empty array if no recent views are found
      }
    } catch (error) {
      // Log or handle the error as necessary
      this.sitesLogger.error(
        'Exception occured in DashboardService.getRecentViewsByUserId() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve recent views for userId ${userId}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Adds a recent view record or updates an existing record for a user.
   * If the user has reached the maximum number of recent views, the oldest view is deleted.
   *
   * @param recentViewDto - DTO containing the recent view data to be added or updated.
   * @returns A message indicating whether the record was inserted or updated successfully.
   * @throws Error if there is an issue inserting or updating the record.
   */
  async addRecentView(recentViewDto: RecentViewDto) {
    this.sitesLogger.log('DashboardService.addRecentView() start');
    this.sitesLogger.debug('DashboardService.addRecentView() start');
    const { userId, siteId } = recentViewDto;
    const maxRecentViews = 5; // Maximum allowed recent views per user

    try {
      // Check if the combination of userId and siteId exists in the table
      const existingRecentView = await this.recentViewsRepository.findOne({
        where: { userId, siteId },
      });

      if (existingRecentView) {
        // If the combination exists, update the existing record
        existingRecentView.address = recentViewDto.address;
        existingRecentView.city = recentViewDto.city;
        existingRecentView.generalDescription =
          recentViewDto.generalDescription;
        existingRecentView.whenUpdated = recentViewDto.whenUpdated;

        // Explicitly update the 'updated' column
        existingRecentView.updated = new Date();
        const result =
          await this.recentViewsRepository.save(existingRecentView);

        if (result) {
          this.sitesLogger.log('DashboardService.addRecentView() end');
          this.sitesLogger.debug('DashboardService.addRecentView() end');
          return 'Record is updated successfully.';
        }
      } else {
        // If the combination does not exist, insert a new record
        const existingRecentViewsCount = await this.recentViewsRepository.count(
          { where: { userId } },
        );
        if (existingRecentViewsCount >= maxRecentViews) {
          // Delete the oldest recent view if the maximum limit is reached
          const oldestRecentView = await this.recentViewsRepository.findOne({
            where: { userId },
            order: { created: 'ASC' },
          });
          await this.recentViewsRepository.delete(oldestRecentView.id);
        }

        // Convert the DTO to entity
        const newRecentView = plainToInstance(RecentViews, recentViewDto);
        const result = await this.recentViewsRepository.save(newRecentView);

        if (result) {
          this.sitesLogger.log('DashboardService.addRecentView() end');
          this.sitesLogger.debug('DashboardService.addRecentView() end');
          return 'Record is inserted successfully.';
        }
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DashboardService.addRecentView() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to insert or update recent view.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
