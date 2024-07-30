import gql from 'graphql-tag';

export const graphQLSnapshotByUserIdAndSiteId = () => {
  return gql`
    query getSnapshotsByUserIdAndSiteId($siteId: String!, $userId: String!) {
      getSnapshotsByUserIdAndSiteId(siteId: $siteId, userId: $userId) {
        httpStatusCode
        message
        data {
           userId
           siteId
           transactionId
           snapshotData
           created
        }
      }
    }
  `;
};
