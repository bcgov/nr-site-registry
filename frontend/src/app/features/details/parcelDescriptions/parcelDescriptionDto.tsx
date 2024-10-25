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
