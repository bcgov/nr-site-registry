import { Field, ObjectType } from '@nestjs/graphql';
import { Sites } from '../entities/sites.entity';
import { ResponseDto } from './response/response.dto';
import { Place } from '../entities/placeEntity';

@ObjectType()
export class MapSearchResponse extends ResponseDto {
  @Field(() => [Sites])
  data: Sites[];
}

@ObjectType()
export class FindSitesAndPlaces extends ResponseDto {
  @Field(() => [Sites])
  sites: Sites[];

  @Field(() => [Place])
  places: Place[];
}

@ObjectType()
export class FindSitesAndPlacesResponse extends ResponseDto {
  @Field(() => FindSitesAndPlaces)
  data: FindSitesAndPlaces;
}
