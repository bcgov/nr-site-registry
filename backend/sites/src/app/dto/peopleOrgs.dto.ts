import { Field, ObjectType } from "@nestjs/graphql";
import { ResponseDto } from "./response/response.dto";

@ObjectType()
export class PeopleOrgsResponse extends ResponseDto {
    @Field(() => [PeopleOrgsDto],  { nullable: true })
    data: PeopleOrgsDto[] | null;
}


@ObjectType()
// @InputType()
export class PeopleOrgsDto {
  
  @Field()
  key: string;
  
  @Field()
  value: Date;
}