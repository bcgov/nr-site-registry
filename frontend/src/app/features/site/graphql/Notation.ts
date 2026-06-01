import gql from 'graphql-tag';

export const graphQLSiteNotationBySiteId = () => {
  return gql`
    query getSiteNotationBySiteId(
      $siteId: String!
      $pending: Boolean
      $includeDeleted: Boolean
    ) {
      getSiteNotationBySiteId(
        siteId: $siteId
        pending: $pending
        includeDeleted: $includeDeleted
      ) {
        httpStatusCode
        success
        message
        timestamp
        data {
          id
          siteId
          psnorgId
          eventDate
          completionDate
          requirementDueDate
          requirementReceivedDate
          requiredAction
          note
          etypCode
          eclsCode
          srAction
          whenCreated
          whenUpdated
          whenDeleted
          whenRestored
          notationParticipant {
            eventParticId
            eventId
            eprCode
            psnorgId
            displayName
            srAction
            srValue
            whenCreated
            whenUpdated
          }
        }
      }
    }
  `;
};
