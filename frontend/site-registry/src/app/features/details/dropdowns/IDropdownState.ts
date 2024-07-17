import { RequestStatus } from "../../../helpers/requests/status";

interface IDropdowns {
    participantNames: [];
    participantRoles: [];
    notationClass:[];
    notationParticipantRole:[];
    notationType:[];
}

export interface IDropdownsState {
    dropdowns: IDropdowns;
    error?: string;
    status: string;
}
