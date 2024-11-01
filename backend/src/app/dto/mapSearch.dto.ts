import { Field, ObjectType } from '@nestjs/graphql';
import { Sites } from '../entities/sites.entity';
import { ResponseDto } from './response/response.dto';

@ObjectType()
export class MapSearchResponse extends ResponseDto {
  @Field(() => [Sites])
  data: Sites[];
}
