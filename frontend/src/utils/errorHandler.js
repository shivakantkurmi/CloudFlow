export const getFriendlyErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  const serverMessage = error.response?.data?.message;
  const errorCode = error.response?.data?.error; // Backend sends { error: 'CODE', message: '...' }
  const status = error.response?.status;

  // ── Map specific backend error codes to clear, user-friendly messages ──
  if (errorCode) {
    switch (errorCode) {
      case 'INVALID_CREDENTIALS':
        return 'Incorrect email or password. Please try again.';
      case 'EMAIL_ALREADY_EXISTS':
        return 'An account with this email already exists. Try signing in instead.';
      case 'ACCOUNT_INACTIVE':
        return 'This account has been deactivated. Please contact support.';
      case 'USER_NOT_FOUND':
        return 'No account found with this email address.';
      case 'UNAUTHORIZED':
        return 'Your session has expired. Please sign in again.';
      case 'FORBIDDEN':
        return serverMessage || 'You do not have permission to perform this action.';
      case 'TASK_NOT_FOUND':
        return 'This task no longer exists or has been deleted.';
      case 'NOT_MEMBER':
        return 'You are not a member of this project.';
      case 'LAST_PM_REMOVAL_FORBIDDEN':
        return 'Cannot remove the last Project Manager. Promote another member first.';
      case 'VALIDATION_ERROR':
        return serverMessage || 'Please check your inputs and try again.';
      default:
        break;
    }
  }

  // ── If the backend sent a specific message and no code matched, use it ──
  if (serverMessage) {
    return serverMessage;
  }

  // ── Generic HTTP status fallback ──
  if (status) {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your inputs and try again.';
      case 401:
        return 'Incorrect email or password. Please try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource could not be found.';
      case 409:
        return 'This email is already registered. Try signing in instead.';
      case 422:
        return 'Unable to process the request. Please check your inputs.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'A server error occurred. Please try again in a moment.';
      default:
        return `Unexpected error (Status ${status}).`;
    }
  }

  // ── Network error (no response from server) ──
  if (error.request) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  return error.message || 'An unexpected error occurred.';
};
