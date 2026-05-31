import { clearAuthSession, getAccessToken } from "./authSession";
import { refreshAuthSession } from "./authRefresh";
import { applyApiKeyToHeaders } from "./apiKey";
import { shouldClearPersistedAuth } from "./authErrors";

const withAuthHeader = (init: RequestInit = {}) => {
  const headers = applyApiKeyToHeaders(new Headers(init.headers));
  const accessToken = getAccessToken();

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return {
    ...init,
    headers,
  };
};

export const authFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  let response = await fetch(input, withAuthHeader(init));

  if (response.status !== 401) {
    return response;
  }

  try {
    await refreshAuthSession();
  } catch (error) {
    if (shouldClearPersistedAuth(error)) {
      clearAuthSession();
    }

    throw error;
  }

  response = await fetch(input, withAuthHeader(init));

  return response;
};
