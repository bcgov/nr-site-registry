import { RequestStatus } from '../../../helpers/requests/status';
import { Sites } from '../../site/dto/Site';

export class Folio {
  userId: string = '';
  folioId: string = '';
  description: string = '';
  whoCreated: string = '';
  whenUpdated: string = '';
  id?: number = 0;
  dirty?: boolean = false;

  constructor(
    userId: string,
    folioId: string,
    description: string,
    whoCreated: string,
  ) {
    this.userId = userId;
    this.folioId = folioId;
    this.description = description;
    this.whoCreated = whoCreated;
  }
}

export interface FolioState {
  folioItems: Folio[];
  fetchRequestStatus: RequestStatus;
  addRequestStatus: RequestStatus;
  deleteRequestStatus: RequestStatus;
  updateRequestStatus: RequestStatus;
  addSiteToFolioRequest: RequestStatus;
  deleteSiteInFolioRequest: RequestStatus;
  sitesArray: FolioContentDTO[];
}

export class FolioContentDTO {
  siteId: string = '';

  id: number = 0;

  folioId: string | undefined = '';

  site?: any = null;

  folio?: any = null;

  constructor(siteId: string, folioId: string, id: number) {
    this.folioId = folioId;
    this.siteId = siteId;
    this.id = id;
  }
}

export class FolioMinDTO {
  id: number = 0;
}
