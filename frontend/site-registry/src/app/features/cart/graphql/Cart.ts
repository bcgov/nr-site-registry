import gql from 'graphql-tag';

export const getCartItemsForUserQL = () => {
  return gql`
    query getCartItemsForUser($userId: String!) {
      getCartItemsForUser(userId: $userId) {
        httpStatusCode
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
  mutation addCartItem($cartDTO: CartDTO!) {
    addCartItem(cartDTO: $cartDTO) {
      result
      message
    }
  }
`;

export const deleteCartItemQL = () => gql`
  mutation deleteCartItem($cartId: String!) {
    deleteCartItem(cartId: $cartId) {
      result
      message
    }
  }
`;
