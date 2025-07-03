import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType({ isAbstract: true })
@ObjectType({ isAbstract: true })
export class ChangeAuditType {
  @Field({ nullable: true })
  userAction?: string;

  @Field({ nullable: true })
  apiAction?: string;

  @Field({ nullable: true })
  srAction?: string;

  @Field(() => Boolean, { nullable: true })
  srValue?: boolean;
}

@InputType()
export class ChangeAuditEntityDTO extends ChangeAuditType {}

@ObjectType()
export class ChangeAuditObjectTypeDTO extends ChangeAuditType {}
