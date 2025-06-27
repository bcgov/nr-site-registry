import { Field, Float, InputType } from '@nestjs/graphql';
import { LatLngTupleScalar } from '../scalars/latLngTuple';
import { LatLngTuple } from '../utils/geometry';

@InputType()
export class RadiusSearchParams {
  @Field(() => LatLngTupleScalar)
  center: LatLngTuple;

  @Field(() => Float)
  radius: number;
}
