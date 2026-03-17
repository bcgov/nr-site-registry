import {
  getFieldLabel,
  getFieldLabelWithContext,
  fieldLabelMap,
  ChangeContext,
} from './fieldLabelMapper';

describe('getFieldLabel', () => {
  it('should return the mapped label for a known key', () => {
    expect(getFieldLabel('id')).toBe('Site ID');
    expect(getFieldLabel('commonName')).toBe('Common Name');
    expect(getFieldLabel('addrLine_1')).toBe('Site Address');
    expect(getFieldLabel('siteRiskCode')).toBe('Site Risk Classification');
  });

  it('should return the key itself for an unknown key', () => {
    expect(getFieldLabel('unknownField')).toBe('unknownField');
    expect(getFieldLabel('')).toBe('');
  });
});

describe('getFieldLabelWithContext', () => {
  it('should return "context: label" when context is provided', () => {
    expect(getFieldLabelWithContext('commonName', 'Site')).toBe(
      'Site: Common Name',
    );
    expect(getFieldLabelWithContext('etypCode', 'Notations')).toBe(
      'Notations: Notation Type',
    );
  });

  it('should return just the label when context is undefined', () => {
    expect(getFieldLabelWithContext('commonName')).toBe('Common Name');
    expect(getFieldLabelWithContext('id')).toBe('Site ID');
  });

  it('should return just the label when context is empty string', () => {
    expect(getFieldLabelWithContext('commonName', '')).toBe('Common Name');
  });

  it('should fall back to key name when field is unknown and no context', () => {
    expect(getFieldLabelWithContext('unknownField')).toBe('unknownField');
  });

  it('should use context with fallback key name for unknown fields', () => {
    expect(getFieldLabelWithContext('unknownField', 'Documents')).toBe(
      'Documents: unknownField',
    );
  });
});

describe('ChangeContext constants', () => {
  it('should have the expected context values', () => {
    expect(ChangeContext.SITE).toBe('Site');
    expect(ChangeContext.SITE_PARTICIPANT).toBe('Site Participants');
    expect(ChangeContext.DOCUMENTS).toBe('Documents');
    expect(ChangeContext.NOTATIONS).toBe('Notations');
    expect(ChangeContext.DISCLOSURE).toBe('Site Disclosure');
    expect(ChangeContext.LAND_USES).toBe('Suspect Land Uses');
    expect(ChangeContext.PARCEL_DESCRIPTIONS).toBe('Parcel Descriptions');
    expect(ChangeContext.ASSOCIATED_SITES).toBe('Associated Sites');
  });
});

describe('fieldLabelMap', () => {
  it('should contain all expected field mappings', () => {
    const expectedKeys = [
      'id',
      'commonName',
      'addrLine_1',
      'city',
      'provState',
      'postalCode',
      'bcerCode',
      'siteRiskCode',
      'sstCode',
      'latDegrees',
      'latMinutes',
      'latSeconds',
      'longDegrees',
      'longMinutes',
      'longSeconds',
      'psnorgId',
      'prCode',
      'effectiveDate',
      'endDate',
      'title',
      'documentDate',
      'submissionDate',
      'etypCode',
      'eclsCode',
      'pin',
      'pid',
    ];
    expectedKeys.forEach((key) => {
      expect(fieldLabelMap).toHaveProperty(key);
    });
  });

  it('should not have empty string values', () => {
    Object.entries(fieldLabelMap).forEach(([key, value]) => {
      expect(value).not.toBe('');
    });
  });
});
