import { RequestStatus } from '../../../helpers/requests/status';
import { ParcelDescriptionType } from './parcelDescriptionsConfig';

export interface IParcelDescriptionDto {
  id: string;
  descriptionType: ParcelDescriptionType;
  idPinNumber: string;
  dateNoted: string;
  landDescription: string;
  srAction: string;
  userAction: string;
}

export interface IParcelDescriptionSaveDto extends IParcelDescriptionDto {
  apiAction: string;
}

export interface IParcelDescriptionResponseDto {
  page: number;
  pageSize: number;
  count: number;
  data: IParcelDescriptionDto[];
}
export interface IFetchParcelDescriptionsParams {
  siteId: number;
  page: number;
  pageSize: number;
  searchParam: string;
  sortBy: string;
  sortByDir: string;
  showPending: boolean;
}

export interface IParcelDescriptionsState {
  siteId: number;
  data: IParcelDescriptionDto[];
  requestStatus: RequestStatus;
  totalResults: number;
  currentPage: number;
  resultsPerPage: number;
  searchParam: string;
  sortBy: string;
  sortByDir: string;
  sortByInputValue: { [key: string]: any };
}
