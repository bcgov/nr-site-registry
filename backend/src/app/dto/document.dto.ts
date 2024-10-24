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

  @Field({ nullable: true })
  filePath: string | null;
}

@InputType()
export class DocumentInputDTO extends ChangeAuditEntityDTO {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsString()
  docParticId: string;

  @Field()
  @IsString()
  psnorgId: string;

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

  @Field({ nullable: true })
  filePath: string | null;
}
