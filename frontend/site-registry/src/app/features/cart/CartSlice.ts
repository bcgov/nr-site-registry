import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RequestStatus } from "../../helpers/requests/status";
import { Cart, CartDeleteDTO, CartDeleteDTOWithSiteId, CartState } from "./dto/Cart";
import { getAxiosInstance } from "../../helpers/utility";
import { GRAPHQL } from "../../helpers/endpoints";
import { addCartItemQL, deleteCartItemQL, deleteCartWithSiteIdItemQL, getCartItemsForUserQL } from "./graphql/Cart";
import { print } from "graphql";

const initialState: CartState = {
  fetchRequestStatus: RequestStatus.idle,
  addRequestStatus : RequestStatus.idle,
  deleteRequestStatus: RequestStatus.idle,
  cartItems: [],
};


export const fetchCartItems = createAsyncThunk(
    'cart/fetchCartItems',
    async (userId: string) => {
      try
      {
        const response = await getAxiosInstance().post( GRAPHQL, {
            query: print(getCartItemsForUserQL()),
            variables: {
                userId:userId
            }
        })     
        return response.data.data.getCartItemsForUser.data;
      }
      catch(error)
      {
        throw error
      }      
    }
  );


  export const addCartItem = createAsyncThunk(
    "addCartItem",
    async (cartInputDTO: Cart[]) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(addCartItemQL()),
        variables: {
          cartDTO: cartInputDTO,
        },
      });
      return request.data;
    }
  );

  export const deleteCartItem = createAsyncThunk(
    "deleteCartItem",
    async (cartDeleteDTO: CartDeleteDTO[]) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(deleteCartItemQL()),
        variables: {
          cartDeleteDTO: cartDeleteDTO,
        },
      });
      return request.data;
    }
  );


  export const deleteCartItemWithSiteId = createAsyncThunk(
    "deleteCartItemWithSiteId",
    async (cartDeleteDTO: CartDeleteDTOWithSiteId[]) => {
      const request = await getAxiosInstance().post(GRAPHQL, {
        query: print(deleteCartWithSiteIdItemQL()),
        variables: {
          cartDeleteDTO: cartDeleteDTO,
        },
      });
      return request.data;
    }
  );


const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
      resetCartItemAddedStatus: (state, action) => {
        const newState = {
          ...state,
        };
  
        newState.addRequestStatus = RequestStatus.idle;
        return newState;
      },
      resetCartItemDeleteStatus: (state, action) => {
        const newState = {
          ...state,
        };       
        newState.deleteRequestStatus = RequestStatus.pending;      
        return newState;
      },
    },
    extraReducers: (builder) => {
        builder
          .addCase(fetchCartItems.pending, (state) => {
            state.fetchRequestStatus = RequestStatus.loading;
          })
          .addCase(fetchCartItems.fulfilled, (state, action) => {
            state.fetchRequestStatus = RequestStatus.success;        
            state.cartItems = action.payload;
          })
          .addCase(fetchCartItems.rejected, (state, action) => {
            state.fetchRequestStatus = RequestStatus.failed;           
          })
          .addCase(addCartItem.fulfilled, (state, action) => {
            state.addRequestStatus = RequestStatus.success;
          })
          .addCase(deleteCartItem.fulfilled, (state, action) => {
            state.deleteRequestStatus = RequestStatus.success;
          })
          .addCase(deleteCartItemWithSiteId.fulfilled,(state, action) => {
            state.deleteRequestStatus = RequestStatus.success;
          })
      },
  });


export const cartItems = (state: any) => state.cart.cartItems;
export const addCartItemRequestStatus = (state: any) => state.cart.addRequestStatus;
export const deleteRequestStatus = (state: any) => state.cart.deleteRequestStatus;

export const {

  resetCartItemAddedStatus,
  resetCartItemDeleteStatus
  
} = cartSlice.actions;

export default cartSlice.reducer;