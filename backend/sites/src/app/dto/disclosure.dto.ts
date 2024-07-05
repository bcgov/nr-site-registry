import { Field, ObjectType } from "@nestjs/graphql";
import { ResponseDto } from "./response/response.dto";
import { SiteProfiles } from "../entities/siteProfiles.entity";

@ObjectType()
export class DisclosureResponse extends ResponseDto {
    @Field(() => [SiteProfiles],  { nullable: true })
    data: SiteProfiles[] | null;
}