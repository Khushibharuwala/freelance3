import { setAuthTokenGetter } from '@workspace/api-client-react';

const TOKEN_KEY = "expense_tracker_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Initialize the API client auth getter
setAuthTokenGetter(() => getToken());
