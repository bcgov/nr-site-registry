import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../logger/logger.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ComsService {
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly region: string;
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly active: boolean;
  private readonly comsApi: string;
  private readonly bucket_path: string;

  /**
   * The constructor for ComsService.
   *
   * @param httpService - The HTTP service for making requests to the COMS API.
   * @param configService - The configuration service for retrieving environment variables.
   * @param loggerService - The logging service for logging messages.
   *
   * The constructor retrieves the necessary environment variables and sets them as properties of the class.
   * The variables are:
   * - VITE_S3_STORAGE_ACCESS_KEY_ID
   * - VITE_S3_STORAGE_SECRET_ACCESS_KEY
   * - VITE_S3_STORAGE_REGION
   * - VITE_S3_STORAGE_BUCKET
   * - VITE_S3_STORAGE_ENDPOINT
   * - VITE_COMS_API
   * - VITE_COMS_BUCKET
   * The constructor also sets the active flag to true.
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {
    this.accessKeyId = this.configService.get<string>(
      'VITE_S3_STORAGE_ACCESS_KEY_ID',
    );
    this.secretAccessKey = this.configService.get<string>(
      'VITE_S3_STORAGE_SECRET_ACCESS_KEY',
    );
    this.region = this.configService.get<string>('VITE_S3_STORAGE_REGION');
    this.bucket = this.configService.get<string>('VITE_S3_STORAGE_BUCKET');
    this.endpoint = this.configService.get<string>('VITE_S3_STORAGE_ENDPOINT');
    this.comsApi = this.configService.get<string>('VITE_COMS_API');
    this.bucket_path = this.configService.get<string>('VITE_COMS_BUCKET');
    this.active = true;
  }

  /**
   * Creates a new bucket with the specified name and key.
   *
   * @param bucketName - The name of the bucket to create.
   * @param bucketKey - The key associated with the bucket.
   * @param context - The context object containing request-specific information, including the JWT access token.
   * @returns An object containing the bucketId if creation is successful.
   * @throws Will throw an error if the bucket creation fails or if there is no response data.
   */
  async createBucket(bucketName: string, bucketKey: string, context: any) {
    try {
      this.loggerService.log(
        `Creating bucket: ${bucketName}, with key: ${bucketKey}`,
      );
      this.loggerService.log(`Creating bucket params`);
      const params = {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
        endpoint: this.endpoint,
        region: this.region,
        bucket: this.bucket,
        active: this.active,
        bucketName: bucketName,
        key: bucketKey,
      };

      this.loggerService.log(`Creating bucket headers`);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${context?.req?.accessTokenJWT || ''}`,
      };

      this.loggerService.log(`Calling comms api to create bucket`);
      const response = await firstValueFrom(
        this.httpService.put(`${this.comsApi}${this.bucket_path}`, params, {
          headers,
        }),
      );
      this.loggerService.log(`Got response from comms api to create bucket`);

      if (response?.data) {
        this.loggerService.log(`Created bucket: ${bucketName}`);
        return { bucketId: response.data.bucketId };
      }
      this.loggerService.log(`Failed to create bucket: ${bucketName}`);
      throw new Error('Bucket creation failed, no response data.');
    } catch (error) {
      this.loggerService.error('Error creating bucket', error);
      throw new Error(`Failed to create bucket: ${error.message}`);
    }
  }
}
