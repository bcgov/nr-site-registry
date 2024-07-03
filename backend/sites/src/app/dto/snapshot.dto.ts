import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";
import GraphQLJSON from "graphql-type-json";
import { ResponseDto } from "./response/response.dto";
import { Snapshots } from "../entities/snapshots.entity";

@ObjectType()
export class SnapshotResponse extends ResponseDto {
    @Field(() => [Snapshots],  { nullable: true })
    data: Snapshots[] | null;
}

@InputType()
export class SnapshotDto {
   
    @Field()
    @IsNotEmpty()
    @IsString()
    userId: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    siteId: string;

    @Field()
    @IsNotEmpty()
    @IsString()
    transactionId: string;

    @Field(() => GraphQLJSON)
    snapshotData: any
}

