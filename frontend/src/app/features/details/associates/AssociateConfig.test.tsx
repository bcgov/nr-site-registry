import {
  GetAssociateConfig,
  ASSOCIATED_SITE_DETAILS_HREF,
} from './AssociateConfig';

describe('GetAssociateConfig associated site links', () => {
  it('points Site ID links at the canonical site details path', () => {
    const { associateColumnInternalSRandViewMode, associateColumnExternal } =
      GetAssociateConfig();

    expect(ASSOCIATED_SITE_DETAILS_HREF).toBe('/site/details/');
    expect(associateColumnInternalSRandViewMode[0].displayType?.href).toBe(
      ASSOCIATED_SITE_DETAILS_HREF,
    );
    expect(associateColumnInternalSRandViewMode[0].linkRedirectionURL).toBe(
      ASSOCIATED_SITE_DETAILS_HREF,
    );
    expect(associateColumnExternal[0].displayType?.href).toBe(
      ASSOCIATED_SITE_DETAILS_HREF,
    );
    expect(associateColumnExternal[0].linkRedirectionURL).toBe(
      ASSOCIATED_SITE_DETAILS_HREF,
    );
  });
});
