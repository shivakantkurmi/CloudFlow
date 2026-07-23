export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  // If the backend sent a specific friendly message, use it
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle Axios generic HTTP errors
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request data. Please check your inputs.';
      case 401:
        return 'Your session has expired or is invalid. Please sign in again.';
      case 402:
        return 'Payment required for this action.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource could not be found.';
      case 409:
        return 'This action conflicts with an existing record.';
      case 422:
        return 'Unable to process the request due to validation errors.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'An internal server error occurred. Please try again later.';
      default:
        return `Unexpected error occurred (Status ${error.response.status}).`;
    }
  }

  // Handle Network Errors (no response from server)
  if (error.request) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Fallback
  return error.message || 'An unexpected error occurred.';
};
