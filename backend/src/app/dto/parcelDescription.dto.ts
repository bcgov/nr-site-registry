import { Field, ObjectType } from '@nestjs/graphql';
import { IsInt, IsDate, IsString } from 'class-validator';
import { PagedResponseDto } from './response/response.dto';

@ObjectType()
export class ParcelDescriptionsResponse extends PagedResponseDto {
  @Field(() => [ParcelDescriptionDto], { nullable: true })
  data: ParcelDescriptionDto[] | null;
}

@ObjectType()
export class ParcelDescriptionDto {
  constructor(
    id: number | null,
    descriptionType: string | null,
    idPinNumber: string | null,
    dateNoted: Date | null,
    landDescription: string | null,
    userAction: string | null,
    srAction: string | null,
  ) {
    this.id = id ? id : 0;
    this.descriptionType = descriptionType ? descriptionType : 'Unknown';
    this.idPinNumber = idPinNumber ? idPinNumber : 'Unknown';
    this.dateNoted = dateNoted;
    this.landDescription = landDescription ? landDescription : '';
    this.userAction = userAction ? userAction : '';
    this.srAction = srAction ? srAction : '';
  }
  @Field()
  @IsInt()
  id: number;

  @Field()
  @IsString()
  descriptionType: string;

  @Field()
  @IsString()
  idPinNumber: string;

  @Field()
  @IsDate()
  dateNoted: Date;

  @Field()
  @IsString()
  landDescription: string;

  @Field()
  @IsString()
  userAction: string;

  @Field()
  @IsString()
  srAction: string;
}
