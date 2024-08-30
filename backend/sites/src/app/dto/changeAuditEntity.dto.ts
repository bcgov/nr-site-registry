import { Field } from '@nestjs/graphql';

export class ChangeAuditEntityDTO {
  @Field()
  userAction: string;

  @Field()
  srAction: string;
}
