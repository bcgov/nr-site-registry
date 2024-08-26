import gql from 'graphql-tag';

export const getLandHistoriesForSiteQuery = gql`
  query getLandHistoriesForSite(
    $siteId: String!
    $searchTerm: String
    $sortDirection: String
  ) {
    getLandHistoriesForSite(
      siteId: $siteId
      searchTerm: $searchTerm
      sortDirection: $sortDirection
    ) {
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
