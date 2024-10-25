import gql from 'graphql-tag';

export const updateSiteDetails = () => gql`
  mutation updateSiteDetails($siteDetailsDTO: SaveSiteDetailsDTO!) {
    updateSiteDetails(siteDetailsDTO: $siteDetailsDTO) {
      message
      httpStatusCode
      success
    }
  }
`;
