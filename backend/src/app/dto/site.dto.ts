import { Field, ObjectType } from '@nestjs/graphql';
import { SiteBastDto as SiteBaseDto } from './siteBase.dto';

@ObjectType()
export class SiteDto extends SiteBaseDto {}
