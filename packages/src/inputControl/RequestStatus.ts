// Enum that defines different statuses for a request (e.g., network or API request)
// This enum is used to track and represent the state of a request throughout its lifecycle.
export enum RequestStatus {
  
  // The request is currently in progress (e.g., fetching data from a server)
  loading = 'loading',

  // The request is idle, meaning no request is in progress
  idle = 'idle',

  // The request has completed successfully (e.g., data was successfully fetched)
  success = 'success',

  // The request has failed (e.g., due to a network error or server issue)
  failed = 'failed',

  // The request is pending, meaning it's in a queue or waiting for some action (could be used to track queued requests)
  pending = 'pending',
}
