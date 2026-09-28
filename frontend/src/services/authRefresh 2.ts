import { refreshAccessToken } from "./authApi";
import { getRefreshToken, setAuthSession } from "./authSession";

let refreshPromise: Promise<void> | null = null;

export const refreshAuthSession = () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return Promise.reject(new Error("Missing refresh token"));
  }

  refreshPromise ??= refreshAccessToken(refreshToken)
    .then((refreshResponse) => {
      setAuthSession({
        nextAccessToken: refreshResponse.accessToken,
        nextRefreshToken: refreshResponse.refreshToken,
        nextUser: refreshResponse.user,
      });
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
