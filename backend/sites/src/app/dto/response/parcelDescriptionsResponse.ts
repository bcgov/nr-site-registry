import { ObjectType, Field } from '@nestjs/graphql';
import { ParcelDescriptionDto } from '../parcelDescription.dto';
import { PagedResponseDto } from './pagedResponse.dto';

@ObjectType()
export class ParcelDescriptionsResponse extends PagedResponseDto {
  constructor(data?: ParcelDescriptionDto[]) {
    super();
    this.data = data;
  }
  @Field(() => [ParcelDescriptionDto], { nullable: true })
  data: ParcelDescriptionDto[] | null;
}
