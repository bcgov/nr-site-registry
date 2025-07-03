import { ObjectType } from '@nestjs/graphql';
import { SiteBaseDto as SiteBaseDto } from './siteBase.dto';

@ObjectType()
export class SiteDto extends SiteBaseDto {}
