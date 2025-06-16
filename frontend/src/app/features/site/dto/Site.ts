export class Sites {
  id: number;
  siteId: number;
  address: string;
  city: string;
  region: string;
  lastUpdatedDate: string;

  constructor() {
    this.id = 0;
    this.siteId = 0;
    this.address = '';
    this.city = '';
    this.region = '';
    this.lastUpdatedDate = '';
  }
}

export class SiteResultDto {
  page: string = '';
  pageSize: string = '';
  count: String = '';
  sites: Sites[] = [];
}

export class SiteInsightsDto {
  eventCount: number = 0;
  siteDocCount: number = 0;
  eventParticCount: number = 0;
  landHistoryCount: number = 0;
  siteAssocCount: number = 0;
  siteSubdivCount: number = 0;
}
