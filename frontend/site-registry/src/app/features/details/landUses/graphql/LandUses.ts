import gql from 'graphql-tag';

export const getLandHistoriesForSiteQuery = gql`
  query getLandHistoriesForSite($siteId: String!) {
    getLandHistoriesForSite(siteId: $siteId) {
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
