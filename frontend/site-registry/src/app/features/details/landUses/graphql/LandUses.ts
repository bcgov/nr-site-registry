import gql from 'graphql-tag';

export const getLandHistoriesForSiteQuery = gql`
  query getLandHistoriesForSite($siteId: String!, $searchTerm: String) {
    getLandHistoriesForSite(siteId: $siteId, searchTerm: $searchTerm) {
      data {
        siteId
        lutCode
        note
        landUse {
          code
          description
        }
      }
    }
  }
`;
