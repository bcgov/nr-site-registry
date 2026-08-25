import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GenericResponse } from '../dto/response/genericResponse'; // Adjust the path as needed
import { CustomExceptionFilter } from './customExceptionFilters';

describe('CustomExceptionFilter', () => {
  let customExceptionFilter: CustomExceptionFilter;
  const graphqlHost = {
    switchToHttp: jest.fn(),
    getType: jest.fn().mockReturnValue('graphql'),
    getArgs: jest.fn().mockReturnValue([]),
  } as unknown as ArgumentsHost;

  beforeEach(() => {
    customExceptionFilter = new CustomExceptionFilter();
  });

  it('should format HttpException correctly', () => {
    const exception = new HttpException('User not found', HttpStatus.NOT_FOUND);
    const response = customExceptionFilter.catch(
      exception,
      graphqlHost,
    ) as GenericResponse<unknown>;

    expect(response).toBeInstanceOf(GenericResponse);
    expect(response.message).toBe('User not found');
    expect(response.httpStatusCode).toBe(HttpStatus.NOT_FOUND);
    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
  });

  it('should format generic error correctly', () => {
    const exception = new Error('Generic error');

    const response = customExceptionFilter.catch(
      exception,
      graphqlHost,
    ) as GenericResponse<unknown>;

    expect(response).toBeInstanceOf(GenericResponse);
    expect(response.message).toBe('Internal server error');
    expect(response.httpStatusCode).toBe(500);
    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
  });

  it('should handle custom error response structure', () => {
    const customErrorResponse = {
      message: 'Custom error message',
      code: 'CUSTOM_ERROR_CODE',
    };
    const exception = new HttpException(
      customErrorResponse,
      HttpStatus.BAD_REQUEST,
    );

    const response = customExceptionFilter.catch(
      exception,
      graphqlHost,
    ) as GenericResponse<unknown>;

    expect(response).toBeInstanceOf(GenericResponse);
    expect(response.message).toBe('Custom error message');
    expect(response.httpStatusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(response.success).toBe(false);
    expect(response.data).toBeNull();
  });

  it('writes the HTTP status and response body for REST errors', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const host = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => ({ status, json }),
      }),
    } as unknown as ArgumentsHost;

    const result = customExceptionFilter.catch(
      new HttpException('Invalid request', HttpStatus.BAD_REQUEST),
      host,
    );

    expect(result).toBeUndefined();
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid request',
        httpStatusCode: HttpStatus.BAD_REQUEST,
        success: false,
      }),
    );
  });
});
