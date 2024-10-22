import { RequestStatus } from '../../../helpers/requests/status';

export interface IParticipant {
  guid: string;
  id: string;
  psnorgId: number;
  effectiveDate: Date;
  endDate: Date | null;
  note: string | null;
  displayName: string;
  prCode: string;
  description: string;
}

export interface IParticipantState {
  siteParticipants: IParticipant[];
  error?: string;
  status: RequestStatus;
}
