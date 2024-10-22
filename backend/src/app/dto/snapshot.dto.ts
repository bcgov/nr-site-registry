import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { ResponseDto } from './response/response.dto';
import { Snapshots } from '../entities/snapshots.entity';

@ObjectType()
export class SnapshotResponse extends ResponseDto {
  @Field(() => [Snapshots], { nullable: true })
  data: Snapshots[] | null;
}

@InputType()
export class CreateSnapshotDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  siteId: string;
}
