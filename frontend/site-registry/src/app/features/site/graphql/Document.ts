import gql from 'graphql-tag';

export const graphQLSiteDocumentsBySiteId = () => {
  return gql`
    query getSiteDocumentsBySiteId($siteId: String!) {
      getSiteDocumentsBySiteId(siteId: $siteId) {
        httpStatusCode
        success
        message
        timestamp
        data {
          id
          docParticId
          siteId
          psnorgId
          dprCode
          submissionDate
          documentDate
          title
          displayName
        }
      }
    }
  `;
};
