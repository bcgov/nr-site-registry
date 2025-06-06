import { registerEnumType } from '@nestjs/graphql';

export enum SiteSortBy {
  ID = 'id',
  SR_STATUS = 'srStatus',
  SITE_RISK_CODE = 'siteRiskCode',
  COMMON_NAME = 'commonName',
  SITE_ADDRESS = 'site_address',
  CITY = 'city',
  WHO_CREATED = 'whoCreated',
  LAT_DEG = 'latdeg',
  LONG_DEG = 'longdeg',
  LAT_DEGREES_MINUTES_SECONDS = 'latDegressMinutesSeconds',
  LONG_DEGREES_MINUTES_SECONDS = 'longDegreesMinutesSeconds',
  WHEN_CREATED = 'whenCreated',
  WHEN_UPDATED = 'whenUpdated',
  LAT_LONG_RELIABILITY_FLAG = 'latlongReliabilityFlag',
  GENERAL_DESCRIPTION = 'generalDescription',
}

registerEnumType(SiteSortBy, {
  name: 'SiteSortBy',
});
