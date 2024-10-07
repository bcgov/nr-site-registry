import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { SiteDocs } from '../entities/siteDocs.entity';
import { IsString } from 'class-validator';
import {
  ChangeAuditEntityDTO,
  ChangeAuditObjectTypeDTO,
} from './changeAuditEntity.dto';

@ObjectType()
export class DocumentResponse extends ResponseDto {
  @Field(() => [DocumentDto], { nullable: true })
  data: DocumentDto[] | null;
}

@ObjectType()
export class DocumentDto extends ChangeAuditObjectTypeDTO {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  docParticId: string;

  @Field({ nullable: true })
  @IsString()
  psnorgId: string;

  // No need f dprCode because this will be Author always as per stand up discussion
  // @Field({nullable: true})
  // dprCode: string;

  @Field({ nullable: true })
  @IsString()
  displayName: string;

  @Field()
  @IsString()
  siteId: string;

  @Field()
  @IsString()
  submissionDate: string;

  @Field({ nullable: true })
  @IsString()
  documentDate?: string | null;

  @Field()
  @IsString()
  title: string;
}

@InputType()
export class DocumentInputDTO extends ChangeAuditEntityDTO {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  docParticId: string;

  @Field()
  @IsString()
  psnorgId: string;

  @Field()
  @IsString()
  displayName: string;

  @Field()
  @IsString()
  siteId: string;

  @Field()
  @IsString()
  submissionDate: string;

  @Field({ nullable: true })
  @IsString()
  documentDate?: string | null;

  @Field()
  @IsString()
  title: string;
}
