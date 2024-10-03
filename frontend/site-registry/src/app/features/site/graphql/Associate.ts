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
          id
          siteId
          siteIdAssociatedWith
          effectiveDate
          note
          srAction
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
