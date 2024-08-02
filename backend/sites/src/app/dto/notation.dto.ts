import { Field, ObjectType } from "@nestjs/graphql";
import { ResponseDto } from "./response/response.dto";
import { IsString } from "class-validator";

@ObjectType()
export class NotationResponse extends ResponseDto {
    @Field(() => [NotationDto],  { nullable: true })
    data: NotationDto[] | null;
}

@ObjectType()
export class NotationDto {

    @Field()
    @IsString()
    id: string;

    @Field()
    @IsString()
    psnorgId: string;

    @Field()
    @IsString()
    siteId: string;

    @Field({nullable: true})
    completionDate: Date | null;
  
    @Field()
    etypCode: string;
    
    @Field()
    eclsCode: string;
  
    @Field({nullable: true})
    requiredAction: string | null;
    
    @Field({nullable: true})
    note: string | null;

    @Field({nullable: true})
    requirementDueDate: Date | null;
  
    @Field({nullable: true})
    requirementReceivedDate: Date | null;

    @Field(()=>[NotationParticipantDto] , {nullable: true})
    notationParticipant: NotationParticipantDto[] | null;
}

@ObjectType()
class NotationParticipantDto {
    
    @Field()
    guid: string;
  
    @Field()
    eprCode: string;
  
    @Field()
    psnorgId: string;
    
    @Field()
    @IsString()
    displayName: string;

}