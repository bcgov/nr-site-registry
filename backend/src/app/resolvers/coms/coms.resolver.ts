import { HttpStatus } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { Coms } from '../../dto/coms/coms.dto';
import { ComsResponse } from '../../dto/response/coms/comsResponse';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LoggerService } from '../../logger/logger.service';
import { ComsService } from '../../services/coms/coms.service';

@Resolver()
export class ComsResolver {
  /**
   * Constructs a new instance of the ComsResolver.
   *
   * @param comsService The service to use for all COMS operations.
   * @param loggerService The service to use for logging.
   * @param comsResponse The GenericResponseProvider to use for generating responses.
   */
  constructor(
    private readonly comsService: ComsService,
    private readonly loggerService: LoggerService,
    private readonly comsResponse: GenericResponseProvider<Coms>,
  ) {}

  /**
   * Creates a new bucket with the specified name and key.
   *
   * @param bucketName - The name of the bucket to be created.
   * @param bucketKey - The key associated with the bucket.
   * @param context - The context containing the request information.
   * @returns A promise that resolves to a ComsResponse indicating the success or failure of the operation.
   *
   * This mutation logs the process of creating a bucket and calls the ComsService to perform the creation.
   * If successful, it returns a response indicating the bucket was created. Otherwise, it returns an error response.
   */
  @Mutation(() => ComsResponse, { name: 'createBucket' })
  async createBucket(
    @Args('bucketName', { type: () => String }) bucketName: string,
    @Args('bucketKey', { type: () => String }) bucketKey: string,
    @Context() context: any,
  ) {
    try {
      this.loggerService.log(
        `InvoiceResolver: createBucket: bucketName: ${bucketName}, bucketKey: ${bucketKey}`,
      );
      const result = await this.comsService.createBucket(
        bucketName,
        bucketKey,
        context,
      ); // Call the ComsService to create the bucket

      if (result) {
        this.loggerService.log(
          `InvoiceResolver: createBucket: bucket created successfully`,
        );
        return this.comsResponse.createResponse(
          'Bucket created successfully',
          HttpStatus.OK,
          true,
          result,
        );
      } else {
        this.loggerService.log(
          `InvoiceResolver: createBucket: Failed to create bucket`,
        );
        return this.comsResponse.createResponse(
          'Failed to create bucket',
          HttpStatus.INTERNAL_SERVER_ERROR,
          false,
          null,
        );
      }
    } catch (error) {
      this.loggerService.error(
        `InvoiceResolver: createBucket: Error creating bucket: ${error.message}`,
        null,
      );
      return this.comsResponse.createResponse(
        'Failed to create bucket',
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        null,
      );
    }
  }
}
