import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class LandHistoriesInputDTO extends ChangeAuditEntityDTO {
  @Field()
  siteId: string;

  @Field()
  lutCode: string;

  @Field()
  note: string | null;

  @Field()
  whoCreated: string;

  @Field()
  whoUpdated: string | null;

  @Field()
  whenCreated: Date;

  @Field()
  whenUpdated: Date | null;

  @Field()
  rwmFlag: number;

  @Field()
  rwmNoteFlag: number;

  @Field()
  siteProfile: string | null;

  @Field()
  profileDateReceived: Date | null;
}
