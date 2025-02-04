import { Field, ObjectType } from '@nestjs/graphql';
import { IsInt, IsDate, IsString, IsBoolean } from 'class-validator';
import { PagedResponseDto } from './response/response.dto';
import { SRApprovalStatusEnum } from '../common/srApprovalStatusEnum';

@ObjectType()
export class ParcelDescriptionsResponse extends PagedResponseDto {
  @Field(() => [ParcelDescriptionDto], { nullable: true })
  data: ParcelDescriptionDto[] | null;
}

export enum ParcelDescriptionType {
  ParcelID = 'Parcel ID',
  CrownLandPIN = 'Crown Land PIN',
  CrownLandFileNumber = 'Crown Land File Number',
  Unknown = 'Unknown',
}

export type ParcelDescriptionTypeValue =
  | ParcelDescriptionType.ParcelID
  | ParcelDescriptionType.CrownLandPIN
  | ParcelDescriptionType.CrownLandFileNumber
  | ParcelDescriptionType.Unknown;

@ObjectType()
export class ParcelDescriptionDto {
  constructor(
    id: string | null,
    descriptionType: ParcelDescriptionTypeValue | null,
    idPinNumber: string | null,
    dateNoted: Date | null,
    landDescription: string | null,
    userAction: string | null,
    srAction: string | null,
  ) {
    this.id = id ? id : '';
    this.descriptionType = descriptionType
      ? descriptionType
      : ParcelDescriptionType.Unknown;
    this.idPinNumber = idPinNumber ? idPinNumber : 'Unknown';
    this.dateNoted = dateNoted;
    this.landDescription = landDescription ? landDescription : '';
    this.userAction = userAction ? userAction : '';
    this.srAction = srAction ? srAction : '';
    this.srValue = srAction === SRApprovalStatusEnum.PUBLIC ? true : false;
  }
  @Field()
  @IsInt()
  id: string;

  @Field()
  @IsString()
  descriptionType: ParcelDescriptionTypeValue;

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

  @Field()
  @IsBoolean()
  srValue: boolean;
}
