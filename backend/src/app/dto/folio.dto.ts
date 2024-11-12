import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ResponseDto } from './response/response.dto';
import { Folio } from '../entities/folio.entity';

@InputType()
export class FolioDTO {
  @Field()
  @IsNumber()
  @IsOptional()
  id: number;

  @Field()
  @IsString()
  userId: string;

  @Field()
  @IsString()
  @IsOptional()
  description: string;

  // @Field(()=>[FolioContentDTO])
  // folioContent: FolioContentDTO[]

  @Field()
  @IsString()
  folioId: string;

  @Field()
  @IsString()
  @IsOptional()
  whoCreated?: string;

  @Field()
  @IsString()
  @IsOptional()
  whenUpdated?: string;
}

// Minified version of Folio DTO
@InputType()
export class FolioMinDTO {
  @Field()
  @IsNumber()
  id: number;

  @Field()
  @IsString()
  userId: string;
}

@ObjectType()
export class FolioResponse extends ResponseDto {
  @Field(() => [Folio], { nullable: true })
  data: Folio[] | null;
}

@InputType()
export class AddSiteToFolioDTO {
  @Field({ description: 'Primary key column of Folio talbe, not `folioId`' })
  @IsNumber()
  id: number;

  @Field()
  @IsString()
  siteId: string;
}
