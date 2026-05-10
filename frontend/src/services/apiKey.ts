export const API_KEY_HEADER = "X-Api-Key";

export const getApiKey = () => import.meta.env.VITE_API_AUTH_TOKEN;

export const applyApiKeyToHeaders = (headers: Headers) => {
  const apiKey = getApiKey();

  if (apiKey) {
    headers.set(API_KEY_HEADER, apiKey);
  }

  return headers;
};
