import gql from 'graphql-tag';

export const graphQLSiteDocumentsBySiteId = () => {
  return gql`
    query getSiteDocumentsBySiteId($siteId: String!, $pending: Boolean) {
      getSiteDocumentsBySiteId(siteId: $siteId, pending: $pending) {
        httpStatusCode
        success
        message
        timestamp
        data {
          id
          siteId
          psnorgId
          submissionDate
          documentDate
          title
          displayName
        }
      }
    }
  `;
};
