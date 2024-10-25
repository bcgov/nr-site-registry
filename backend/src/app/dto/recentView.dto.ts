import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { ResponseDto } from './response/response.dto';
import { RecentViews } from '../entities/recentViews.entity';

@ObjectType()
export class RecentViewResponse extends ResponseDto {
  @Field(() => [RecentViews], { nullable: true })
  data: RecentViews[] | null;
}

@InputType()
export class RecentViewDto {
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
  address: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  city: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  generalDescription: string | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  whenUpdated: Date | null;
}
