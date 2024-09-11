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
        guid
        siteId
        lutCode
        note
        whenCreated
        landUse {
          code
          description
        }
      }
    }
  }
`;

export const getLandUseCodesQuery = gql`
  {
    getLandUseCodes {
      data {
        description
        code
      }
    }
  }
`;
