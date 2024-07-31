import gql from 'graphql-tag';

export const graphQLSnapshotBySiteId = () => {
  return gql`
    query getSnapshotsBySiteId($siteId: String!) {
      getSnapshotsBySiteId(siteId: $siteId) {
        httpStatusCode
        message
        data {
          siteId
          created
        }
      }
    }
  `;
};
