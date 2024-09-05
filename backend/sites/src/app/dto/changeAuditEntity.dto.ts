import { Field, InputType } from '@nestjs/graphql';
@InputType()
export class ChangeAuditEntityDTO {
  @Field()
  userAction: string;

  @Field()
  srAction: string;
}
