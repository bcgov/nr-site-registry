export const ChangeContext = {
  SITE: 'Site',
  SITE_LOCATION: 'Site Location Details',
  SITE_LOCATION_SR: 'Site Location Details SR Mode',
  SITE_PARTICIPANT: 'Site Participants',
  ASSOCIATED_SITES: 'Associated Sites',
  LAND_USES: 'Suspect Land Uses',
  DOCUMENTS: 'Documents',
  DISCLOSURE: 'Site Disclosure',
  DISCLOSURE_SCHEDULE: 'Site Disclosure Schedule',
  NOTATIONS: 'Notations',
  NOTATION_PARTICIPANT: 'Notation Participants',
  PARCEL_DESCRIPTIONS: 'Parcel Descriptions',
} as const;

export const fieldLabelMap: { [key: string]: string } = {
  id: 'Site ID',
  commonName: 'Common Name',
  addrLine_1: 'Site Address',
  addrType: 'Address Type',
  city: 'City',
  provState: 'Province',
  postalCode: 'Postal Code',
  bcerCode: 'Region',
  siteRiskCode: 'Site Risk Classification',
  sstCode: 'Site Status',
  latlongReliabilityFlag: 'Lat/Long Reliability',
  generalDescription: 'Location Description',

  latDegrees: 'Latitude Degrees',
  latMinutes: 'Latitude Minutes',
  latSeconds: 'Latitude Seconds',

  longDegrees: 'Longitude Degrees',
  longMinutes: 'Longitude Minutes',
  longSeconds: 'Longitude Seconds',

  psnorgId: 'Participant Name',
  prCode: 'Role(s)',
  effectiveDate: 'Start Date',
  endDate: 'End Date',
  note: 'Note',
  srValue: 'SR Status',

  siteIdAssociatedWith: 'Associated Site',

  title: 'Document Title',
  documentDate: 'Document Date',
  submissionDate: 'Received Date',
  organizationName: 'Organization',

  siteRegDateRecd: 'Date Received',
  dateCompleted: 'Date Completed',
  localAuthDateRecd: 'Local Authority Received',
  rwmDateDecision: 'Date Registrar Received',
  siteRegDateEntered: 'Date Entered',
  schedule2ReferenceCode: 'Schedule 2 Reference',
  description: 'Description',
  plannedActivityComment: 'Planned Activity Comment',
  siteDisclosureComment: 'Site Disclosure Comment',
  govDocumentsComment: 'Government Documents Comment',

  etypCode: 'Notation Type',
  eclsCode: 'Notation Class',
  requirementReceivedDate: 'Initiated Date',
  requirementDueDate: 'Required Date',
  completionDate: 'Completed Date',
  requiredAction: 'Required Actions',

  eprCode: 'Role',

  landUse: 'Land Use',
  'landUse.code': 'Land Use Code',
  'landUse.description': 'Land Use Description',
  landUseCode: 'Land Use Code',

  pin: 'PIN',
  pid: 'PID',
  crownLandsFileNumber: 'Crown Lands File Number',
  legalDescription: 'Legal Description',
  dateNoted: 'Date Noted',
  parcelDescription: 'Parcel Description',
  newDocument: 'New Document',
  document: 'Document',
};

export const getFieldLabel = (graphQLPropertyName: string): string => {
  return fieldLabelMap[graphQLPropertyName] || graphQLPropertyName;
};

export const getFieldLabelWithContext = (
  graphQLPropertyName: string,
  context?: string,
): string => {
  const label = getFieldLabel(graphQLPropertyName);
  return context ? `${context}: ${label}` : label;
};
