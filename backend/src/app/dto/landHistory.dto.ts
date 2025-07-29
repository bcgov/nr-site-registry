import { Field, ObjectType } from '@nestjs/graphql';
import { ResponseDto } from './response/response.dto';
import { ChangeAuditObjectTypeDTO } from './changeAuditEntity.dto';
import { LandUseCd } from '../entities/landUseCd.entity';
import { Sites } from '../entities/sites.entity';

@ObjectType()
export class LandHistoryResponse extends ResponseDto {
  @Field(() => [LandHistoriesDTO], { nullable: true })
  data: LandHistoriesDTO[] | null;
}

@ObjectType()
class LandHistoriesDTO extends ChangeAuditObjectTypeDTO {
  @Field()
  siteId: string;

  @Field()
  guid: string;

  @Field()
  lutCode: string;

  @Field({ nullable: true })
  note: string | null;

  @Field()
  whoCreated: string;

  @Field({ nullable: true })
  whoUpdated: string | null;

  @Field()
  whenCreated: Date;

  @Field({ nullable: true })
  whenUpdated: Date | null;

  @Field()
  rwmFlag: number;

  @Field()
  rwmNoteFlag: number;

  @Field({ nullable: true })
  siteProfile: string | null;

  @Field({ nullable: true })
  profileDateReceived: Date | null;

  @Field(() => LandUseCd)
  landUse: LandUseCd;

  @Field(() => Sites)
  site: Sites;
}
