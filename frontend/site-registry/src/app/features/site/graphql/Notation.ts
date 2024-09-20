import gql from 'graphql-tag';

export const graphQLSiteNotationBySiteId = () => {
  return gql`
    query getSiteNotationBySiteId($siteId: String!) {
      getSiteNotationBySiteId(siteId: $siteId) {
        httpStatusCode
        success
        message
        timestamp
        data {
          id
          siteId
          psnorgId
          completionDate
          requirementDueDate
          requirementReceivedDate
          requiredAction
          note
          etypCode
          eclsCode
          srAction
          notationParticipant {
            guid
            eventId
            eprCode
            psnorgId
            displayName
            srAction
          }
        }
      }
    }
  `;
};
