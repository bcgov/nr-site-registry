import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';
import { DescriptionTypeValue } from './parcelDescription.dto';

@InputType()
export class ParcelDescriptionInputDTO extends ChangeAuditEntityDTO {
  @Field()
  id: string;

  @Field()
  descriptionType: DescriptionTypeValue;

  @Field()
  idPinNumber: string | null;

  @Field()
  dateNoted: Date;

  @Field()
  landDescription: string | null;
}
