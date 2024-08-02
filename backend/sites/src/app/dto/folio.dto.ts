import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { FolioContentDTO } from './folioContent.dto';
import { ResponseDto } from './response/response.dto';
import { Folio } from '../entities/folio.entity';

import { FolioContents } from '../entities/folioContents.entity';
import { IsNumber, IsOptional, isString, IsString } from 'class-validator';

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
