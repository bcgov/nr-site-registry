import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';
import { ParcelDescriptionTypeValue } from './parcelDescription.dto';

@InputType()
export class ParcelDescriptionInputDTO extends ChangeAuditEntityDTO {
  @Field()
  id: string;

  @Field()
  descriptionType: ParcelDescriptionTypeValue;

  @Field()
  idPinNumber: string | null;

  @Field()
  dateNoted: Date;

  @Field()
  landDescription: string | null;
}
