import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response.dto'

@ObjectType()
export class PagedResponseDto extends ResponseDto {
  constructor() {
    super();
  }

  @Field()
  count: number;

  @Field()
  page: number;

  @Field()
  pageSize: number;
}

