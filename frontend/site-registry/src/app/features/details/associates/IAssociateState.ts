export interface IAssociate {
  guid: string;
  siteId: string;
  siteIdAssociatedWith: string;
  effectiveDate: Date;
  note: string | null;
}

export interface IAssociateState {
  siteAssociate: IAssociate[];
  error?: string;
  status: string;
}
