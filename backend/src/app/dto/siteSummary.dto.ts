import { InputType } from '@nestjs/graphql';
import { SiteBastDto } from './siteBase.dto';

@InputType()
export class SiteSummaryDTO extends SiteBastDto {}
