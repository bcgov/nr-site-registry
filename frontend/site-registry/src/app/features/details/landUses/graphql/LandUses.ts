import gql from 'graphql-tag';

export const getLandHistoriesForSiteQuery = gql`
  query getLandHistoriesForSite(
    $siteId: String!
    $searchTerm: String
    $sortDirection: String,
    $pending: Boolean
  ) {
    getLandHistoriesForSite(
      siteId: $siteId
      searchTerm: $searchTerm
      sortDirection: $sortDirection,
      pending: $pending
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
