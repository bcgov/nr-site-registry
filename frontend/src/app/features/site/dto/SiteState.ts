import { ChangeTracker } from '../../../components/common/IChangeType';
import { RequestStatus } from '../../../helpers/requests/status';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../../details/dto/SiteDetailsMode';
import { SiteInsightsDto, SiteResultDto, Sites } from './Site';

export class SiteState {
  siteDetails?: Sites | null = null;
  siteDetailsFetchStatus: string = RequestStatus.idle;
  siteDetailsDeleteStatus: string = RequestStatus.idle;
  siteDetailsAddedStatus: string = RequestStatus.idle;
  siteDetailsUpdateStatus: string = RequestStatus.idle;
  changeTracker: ChangeTracker[] = [];
  siteDetailsMode: SiteDetailsMode = SiteDetailsMode.ViewOnlyMode;
  resetSiteDetails: boolean = false;
  userType: UserType = UserType.External;
  siteInsights?: SiteInsightsDto | null = null;
  siteInsightsFetchStatus: string = RequestStatus.idle;
}
