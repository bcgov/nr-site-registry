import gql from 'graphql-tag';

export const graphQLSiteParticipantsBySiteId = () => {
  return gql`
    query getSiteParticipantBySiteId($siteId: String!, $pending: Boolean) {
      getSiteParticipantBySiteId(siteId: $siteId, pending: $pending) {
        httpStatusCode
        success
        message
        timestamp
        data {
          partiRoleId
          id
          psnorgId
          siteId
          effectiveDate
          endDate
          note
          displayName
          prCode
          description
        }
      }
    }
  `;
};
