import gql from 'graphql-tag';

export const getFolioItemsForUserQL = () => {
  return gql`
    query getFolioItemsForUser($userId: String!) {
      getFolioItemsForUser(userId: $userId) {
        message
        httpStatusCode
        data {
          id
          userId
          folioId
          description
          whoCreated
          whenUpdated
        }
      }
    }
  `;
};

export const getSitesForFolioQL = () => {
  return gql`
    query getSitesForFolio($folioDTO: FolioMinDTO!) {
      getSitesForFolio(folioDTO: $folioDTO) {
        message
        httpStatusCode
        data {
          id
          siteId
          folioId
          whoCreated
          whenUpdated
          site {
            city
            addrLine_1
            addrLine_2
            addrLine_3
          }
          folio {
            folioId
            description
          }
        }
      }
    }
  `;
};

export const addFolioItemQL = () => gql`
  mutation addFolioItem($FolioDTO: FolioDTO!) {
    addFolioItem(folioDTO: $FolioDTO) {
      message
      httpStatusCode
      success
    }
  }
`;

export const updateFolioItemQL = () => gql`
  mutation updateFolioItem($FolioDTO: [FolioDTO!]!) {
    updateFolioItem(folioDTO: $FolioDTO) {
      message
      httpStatusCode
      success
    }
  }
`;

export const deleteFolioItemQL = () => gql`
  mutation deleteFolioItem($folioId: Float!) {
    deleteFolioItem(folioId: $folioId) {
      message
      httpStatusCode
      success
    }
  }
`;

export const addSiteToFolioQL = () => gql`
  mutation addSiteToFolio($folioDTO: [FolioContentDTO!]!) {
    addSiteToFolio(folioDTO: $folioDTO) {
      message
      httpStatusCode
      success
    }
  }
`;

export const deleteSitesInFolioQL = () => gql`
  mutation deleteSitesInFolio($folioDTO: [FolioContentDTO!]!) {
    deleteSitesInFolio(folioDTO: $folioDTO) {
      message
      httpStatusCode
      success
    }
  }
`;
