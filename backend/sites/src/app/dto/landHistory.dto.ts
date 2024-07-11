import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { LandHistories } from '../entities/landHistories.entity';

@ObjectType()
export class LandHistoryResponse extends ResponseDto {
    @Field(() => [LandHistories], { defaultValue: [] })
    data: LandHistories[];
}
