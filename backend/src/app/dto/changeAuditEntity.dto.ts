import { Field, InputType, ObjectType } from '@nestjs/graphql';
@InputType()
export class ChangeAuditEntityDTO {
  @Field({ nullable: true })
  userAction: string;

  @Field({ nullable: true })
  apiAction: string;

  @Field()
  srAction: string;

  @Field(() => Boolean, { nullable: true })
  srValue: boolean;
}

@ObjectType()
export class ChangeAuditObjectTypeDTO {
  @Field()
  userAction: string;

  @Field()
  srAction: string;

  @Field()
  srValue: string;
}
