import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GenericResponse } from '../dto/response/genericResponse';

@Catch()
export class CustomExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const messageResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';
    const message =
      typeof messageResponse === 'string'
        ? messageResponse
        : messageResponse['message'];

    // Format the error response
    const result = new GenericResponse(message, status, false, null);
    return result;
  }
}
