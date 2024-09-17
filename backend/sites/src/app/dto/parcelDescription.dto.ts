import { Field, ObjectType } from '@nestjs/graphql';
import { IsInt, IsDate, IsString } from 'class-validator';

@ObjectType()
export class ParcelDescriptionDto {
  constructor(
    id: number | null,
    descriptionType: string | null,
    idPinNumber: string | null,
    dateNoted: Date | null,
    landDescription: string | null,
  ) {
    this.id = id ? id : 0;
    this.descriptionType = descriptionType ? descriptionType : 'Unknown';
    this.idPinNumber = idPinNumber ? idPinNumber : 'Unknown';
    this.dateNoted = dateNoted;
    this.landDescription = landDescription ? landDescription : '';
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
}
