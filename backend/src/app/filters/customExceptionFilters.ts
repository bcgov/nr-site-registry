import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import type { Response } from 'express';
import { GenericResponse } from '../dto/response/genericResponse';

@Catch()
export class CustomExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const messageResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';
    const responseMessage =
      typeof messageResponse === 'string'
        ? messageResponse
        : (messageResponse as { message?: string | string[] }).message;
    const message = Array.isArray(responseMessage)
      ? responseMessage.join('; ')
      : (responseMessage ?? 'Internal server error');

    const body = new GenericResponse(message, status, false, null);
    if (host.getType() === 'http') {
      host.switchToHttp().getResponse<Response>().status(status).json(body);
      return;
    }

    return body;
  }
}
