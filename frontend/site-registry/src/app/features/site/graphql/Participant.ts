import gql from 'graphql-tag';

export const graphQLSiteParticipantsBySiteId = () => {
  return gql`
    query getSiteParticipantBySiteId($siteId: String!) {
      getSiteParticipantBySiteId(siteId: $siteId) {
        httpStatusCode
        success
        message
        timestamp
        data {
          guid
          id
          psnorgId
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
