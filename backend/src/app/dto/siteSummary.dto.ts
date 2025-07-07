import { InputType } from '@nestjs/graphql';
import { SiteBaseDto } from './siteBase.dto';

@InputType()
export class SiteSummaryDTO extends SiteBaseDto {}
