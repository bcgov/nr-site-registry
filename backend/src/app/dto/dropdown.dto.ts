import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';

@ObjectType()
export class DropdownResponse extends ResponseDto {
  @Field(() => [DropdownDto], { nullable: true })
  data: DropdownDto[] | null;
}

@ObjectType()
export class DropdownResponseWithMetaData extends ResponseDto {
  @Field(() => [NotationDropdownDto], { nullable: true })
  data: NotationDropdownDto[] | null;
}

@ObjectType()
export class DropdownDto {
  @Field()
  key: string;

  @Field()
  value: string;
}

@ObjectType()
export class NotationDropdownDto {
  @Field()
  metaData: string;

  @Field(() => [DropdownDto])
  dropdownDto: DropdownDto[];
}
