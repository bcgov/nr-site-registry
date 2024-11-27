import { RequestStatus } from '../../../helpers/requests/status';

export interface IParcelDescriptionDto {
  id: number;
  descriptionType: string;
  idPinNumber: string;
  dateNoted: string;
  landDescription: string;
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
