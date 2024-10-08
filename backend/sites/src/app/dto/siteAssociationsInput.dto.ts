import { Field, InputType } from '@nestjs/graphql';
import { ChangeAuditEntityDTO } from './changeAuditEntity.dto';

@InputType()
export class SiteAssociationsInputDTO extends ChangeAuditEntityDTO {
  @Field()
  siteId: string;

  @Field()
  siteIdAssociatedWith: string;

  @Field()
  effectiveDate: Date;

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
  commonPid: string;
}
