import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { SiteAssocs } from '../entities/siteAssocs.entity';
import { IsDate, IsString } from 'class-validator';

@ObjectType()
export class AssociatedSiteResponse extends ResponseDto {
  @Field(() => [AssociatedSiteDto], { nullable: true })
  data: AssociatedSiteDto[] | null;
}

@ObjectType()
export class AssociatedSiteDto {
  @Field()
  guid: string;

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
