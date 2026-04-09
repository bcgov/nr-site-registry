import { RequestStatus } from '../../../helpers/requests/status';

export interface IDisclosureState {
  siteDisclosure: {
    id: string;
    siteId: string;
    dateCompleted: string;
    rwmDateDecision: string;
    localAuthDateRecd: string;
    siteRegDateEntered: string;
    siteRegDateRecd: string;
    govDocumentsComment: string;
    siteDisclosureComment: string;
    plannedActivityComment: string;
    srAction: string;
    whenCreated: string;
    whenUpdated: string;
    siteProfileSchedule2Refs: {
      id: string;
      profileId: string;
      schedule2ReferenceCode: string;
      srAction: string;
      srValue: boolean;
    }[];
  };
  error?: string;
  status: RequestStatus;
}
