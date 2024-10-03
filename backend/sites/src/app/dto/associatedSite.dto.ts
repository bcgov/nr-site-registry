import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { SiteAssocs } from '../entities/siteAssocs.entity';
import { IsDate, IsString } from 'class-validator';
import {
  ChangeAuditEntityDTO,
  ChangeAuditObjectTypeDTO,
} from './changeAuditEntity.dto';

@ObjectType()
export class AssociatedSiteResponse extends ResponseDto {
  @Field(() => [AssociatedSiteDto], { nullable: true })
  data: AssociatedSiteDto[] | null;
}

@ObjectType()
export class AssociatedSiteDto extends ChangeAuditObjectTypeDTO {
  @Field()
  id: string;

  @Field()
  @IsString()
  siteId: string;

  @Field()
  @IsString()
  siteIdAssociatedWith: string;

  @Field()
  @IsDate()
  effectiveDate: Date;

  @Field({ nullable: true })
  @IsString()
  note: string | null;
}

@InputType()
export class SiteAssociationsInputDTO extends ChangeAuditEntityDTO {
  @Field()
  id: string;

  @Field()
  siteId: string;

  @Field()
  siteIdAssociatedWith: string;

  @Field()
  effectiveDate: Date;

  @Field({ nullable: true })
  note: string | null;
}
