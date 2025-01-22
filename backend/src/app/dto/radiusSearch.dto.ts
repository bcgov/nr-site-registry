import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class RadiusSearchParams {
  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => Float)
  radius: number;
}
