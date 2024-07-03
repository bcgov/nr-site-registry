import { Field, ObjectType } from "@nestjs/graphql";
import { ResponseDto } from "./response/response.dto";
import { ParticRoleCd } from "../entities/particRoleCd.entity";

@ObjectType()
export class ParticipantRoleCdResponse extends ResponseDto {
    @Field(() => [ParticipantRoleCdDto],  { nullable: true })
    data: ParticipantRoleCdDto[] | null;
}

@ObjectType()
// @InputType()
export class ParticipantRoleCdDto {
  
  @Field()
  key: string;
  
  @Field()
  value: Date;
}