import gql from 'graphql-tag';

export const getCartItemsForUserQL = () => {
  return gql`
    query getCartItemsForUser($userId: String!) {
      getCartItemsForUser(userId: $userId) {
        httpStatusCode
        message
        data {
          id
          userId
          siteId
          price
          site {
            id
            addrLine_1
            addrLine_2
            addrLine_3
            city
          }
        }
      }
    }
  `;
};

export const addCartItemQL = () => gql`
mutation addCartItem($cartDTO: [CartDTO!]!){
  addCartItem(cartDTO:$cartDTO){
    message
    httpStatusCode
    success
  }
}`


export const deleteCartItemQL = () => gql`
mutation deleteCartItem($cartDeleteDTO:[CartDeleteDTO!]!)
{
    deleteCartItem(cartDeleteDTO: $cartDeleteDTO)
    {
         message
         httpStatusCode
         success
    }
}
`


export const deleteCartWithSiteIdItemQL = () => gql`
mutation deleteCartItemWithSiteId($cartDeleteDTO:[CartDeleteDTOWithSiteID!]!)
{
    deleteCartItemWithSiteId(cartDeleteDTO: $cartDeleteDTO)
    {
         message
         httpStatusCode
         success
    }
  }
`;
