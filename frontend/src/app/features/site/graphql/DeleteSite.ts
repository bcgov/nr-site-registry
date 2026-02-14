import gql from 'graphql-tag';

export const DELETE_SITE_MUTATION = gql`
  mutation DeleteSite($input: DeleteSiteInput!) {
    deleteSite(input: $input) {
      success
      message
      httpStatusCode
      timestamp
    }
  }
`;
