import { RequestStatus } from "../../../helpers/requests/status";

export interface ISnapshotState {
    snapshot: [];
    error?: string;
    status: RequestStatus;
    createSnapshotRequest: RequestStatus
}

export interface CreateSnapshotInputDto
{
    siteId: string;
}


