import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { IsDate, IsString } from 'class-validator';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@ObjectType()
export class SiteParticsResponse extends ResponseDto {
  @Field(() => [SiteParticsDto], { nullable: true })
  data: SiteParticsDto[] | null;
}

@ObjectType()
export class SiteParticsDto {
  @Field()
  partiRoleId: string;

  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  psnorgId: string;

  @Field()
  siteId: string;

  @Field()
  @IsDate()
  effectiveDate: Date;

  @Field({ nullable: true })
  @IsDate()
  endDate: Date | null;

  @Field({ nullable: true })
  @IsString()
  note: string | null;

  @Field()
  @IsString()
  displayName: string;

  @Field()
  @IsString()
  prCode: string;

  @Field()
  @IsString()
  description: string;
}

@InputType()
export class SiteParticsInputDto extends ChangeAuditEntityDTO {
  @Field()
  partiRoleId: string;

  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  psnorgId: string;

  @Field()
  siteId: string;

  @Field()
  @IsDate()
  effectiveDate: Date;

  @Field({ nullable: true })
  @IsDate()
  endDate: Date | null;

  @Field({ nullable: true })
  @IsString()
  note: string | null;

  @Field()
  @IsString()
  displayName: string;

  @Field()
  @IsString()
  prCode: string;

  @Field()
  @IsString()
  description: string;
}
