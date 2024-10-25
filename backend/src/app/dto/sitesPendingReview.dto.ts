import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@ObjectType()
export class SitePendingApprovalRecords {
  @Field()
  id: string;

  @Field()
  siteId: string;

  @Field()
  changes: string;

  @Field()
  whoUpdated: string;

  @Field()
  whenUpdated: Date;

  @Field()
  address: string;
}

@ObjectType()
export class SitePendingApprovalDTO extends ResponseDto {
  data: SitePendingApprovalRecords[];
}

@ObjectType()
export class QueryResultForPendingSites extends ResponseDto {
  @Field(() => Number)
  totalRecords: number;

  @Field(() => [SitePendingApprovalRecords], { nullable: true })
  data: SitePendingApprovalRecords[];
}

@ObjectType()
export class QueryResultForPendingSitesResponse extends ResponseDto {
  @Field(() => QueryResultForPendingSites)
  data: QueryResultForPendingSites;
}

@InputType()
export class SearchParams {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  changes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  whenUpdated?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  whoCreated?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  addrLine?: string;
}

@ObjectType()
export class SRApproveRejectResponse extends ResponseDto {
  @Field(() => [SitePendingApprovalDTO], { nullable: true })
  data: SitePendingApprovalDTO[] | null;
}

@InputType()
export class SiteRecordsForSRAction {
  @Field()
  id: string;

  @Field(() => String)
  siteId: string;

  @Field(() => String)
  changes: string;

  @Field(() => String)
  whoUpdated: string;

  @Field(() => String)
  whenUpdated: Date;

  @Field(() => String)
  address: string;
}

@InputType()
export class BulkApproveRejectChangesDTO {
  @Field(() => Boolean)
  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;

  @Field(() => [SiteRecordsForSRAction])
  @IsArray()
  @IsNotEmpty()
  sites: SiteRecordsForSRAction[];
}
