import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class LandHistoriesInputDTO extends ChangeAuditEntityDTO {
  @Field({ nullable: true })
  originalLandUseCode: string;

  @Field({ nullable: true })
  landUseCode: string;

  @Field({ nullable: true })
  note: string;

  @Field({ defaultValue: false })
  shouldDelete: boolean;
}
