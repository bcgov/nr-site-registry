import gql from 'graphql-tag';

export const graphQLAssociatedSitesBySiteId = () => {
  return gql`
    query getAssociatedSitesBySiteId($siteId: String!) {
      getAssociatedSitesBySiteId(siteId: $siteId) {
        httpStatusCode
        success
        message
        timestamp
        data {
          guid
          siteId
          siteIdAssociatedWith
          effectiveDate
          note
        }
      }
    }
  `;
};

export const graphqlSearchSiteIdsQuery = () => {
  return gql`
    query searchSiteIds($searchParam: String!) {
      searchSiteIds(searchParam: $searchParam) {
        httpStatusCode
        success
        message
        timestamp
        data {
          key
          value
        }
      }
    }
  `;
};
