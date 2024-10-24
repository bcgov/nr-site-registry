import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class ParcelDescriptionInputDTO extends ChangeAuditEntityDTO {
  @Field()
  id: string;

  @Field()
  descriptionType: string;

  @Field()
  idPinNumber: string | null;

  @Field()
  dateNoted: Date;

  @Field()
  landDescription: string | null;
}
