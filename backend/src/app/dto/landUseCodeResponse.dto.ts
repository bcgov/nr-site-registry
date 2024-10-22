import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { LandUseCd } from '../entities/landUseCd.entity';

@ObjectType()
export class LandUseCodeResponse extends ResponseDto {
  @Field(() => [LandUseCd], { defaultValue: [] })
  data: LandUseCd[];
}
