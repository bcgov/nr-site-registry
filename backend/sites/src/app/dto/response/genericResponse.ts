import { Field, ObjectType } from '@nestjs/graphql';
import { Sites } from '../../entities/sites.entity';
import { BaseHttpResponse } from './baseHttpResponse';

/**
 * Class for returing fetch site response from graphql services
 */
@ObjectType()
export class FetchSiteResponse extends BaseHttpResponse {
  @Field(() => [Sites])
  data: Sites[];

  constructor(
    message?: string,
    httpStatusCode?: number,
    success?: boolean,
    data?: Sites[] | null,
  ) {
    super(message, httpStatusCode, success);
    this.data = data;
  }
}

@ObjectType()
export class SaveSiteDetailsResponse extends BaseHttpResponse {
  @Field(() => [Sites])
  data: Sites[];

  constructor(
    message?: string,
    httpStatusCode?: number,
    success?: boolean,
    data?: Sites[] | null,
  ) {
    super(message, httpStatusCode, success);
    this.data = data;
  }
}

/**
 * Class for returing fetch site response from graphql services
 */
@ObjectType()
export class FetchSiteDetail extends BaseHttpResponse {
  @Field(() => Sites, {nullable: true})
  data?: Sites;

  constructor(
    message?: string,
    httpStatusCode?: number,
    success?: boolean,
    data?: Sites | null,
  ) {
    super(message, httpStatusCode, success);
    this.data = data;
  }
}

/**
 * Class for returing search site response from graphql services
 */
@ObjectType()
export class SearchSiteResponse {
  @Field(() => [Sites])
  sites: Sites[];

  @Field()
  count: number;

  @Field()
  page: number;

  @Field()
  pageSize: number;
}

export class GenericResponse<T> extends BaseHttpResponse {
  data?: T;
  constructor(
    message?: string,
    httpStatusCode?: number,
    success?: boolean,
    data?: T | null,
  ) {
    super(message, httpStatusCode, success);
    this.data = data;
  }
}
