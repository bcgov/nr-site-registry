import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { isNullableType } from 'graphql';
import { ResponseDto } from './response/response.dto';
import { FolioContents } from '../entities/folioContents.entity';

@InputType()
export class FolioContentDTO {
  @Field()
  @IsString()
  siteId: string;

  @Field()
  @IsNumber()
  id: number;

  @Field()
  @IsString()
  folioId: string;

  @Field()
  @IsOptional()
  @IsString()
  userId: string;

  @Field()
  @IsOptional()
  @IsString()
  whoCreated: string;
}

@ObjectType()
export class FolioContentResponse extends ResponseDto {
  @Field(() => [FolioContents], { nullable: true })
  data: FolioContents[] | null;
}
