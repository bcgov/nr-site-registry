import { RequestStatus } from "../../../helpers/requests/status";

export class Cart {
  userId: string = "";
  siteId: string = "";
  price: number = 0;
  whoCreated: string = "";
}

export interface CartState {
  cartItems: Cart[];
  fetchRequestStatus: RequestStatus;
  addRequestStatus : RequestStatus;
  deleteRequestStatus : RequestStatus
}

