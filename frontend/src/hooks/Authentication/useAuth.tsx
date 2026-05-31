import { useCallback, useEffect, useState, useContext, createContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUsersStore } from "@/store/userStore";
import { LoginResponse } from "@/interfaces/IAuth";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  loadPersistedAuthSession,
  setAuthSession,
  subscribeAuthSession,
} from "@/services/authSession";
import { refreshAuthSession } from "@/services/authRefresh";
import { logoutRefreshSession } from "@/services/authApi";
import { shouldClearPersistedAuth } from "@/services/authErrors";

interface AuthContext {
  authed: boolean;
  loading: boolean;
  login: (session: LoginResponse) => Promise<void>;
  logout: () => Promise<void>;
}

const authContext = createContext<AuthContext | undefined>(undefined);

function useAuth(): AuthContext {
  const queryClient = useQueryClient();
  const setCurrentUser = useUsersStore((state) => state.setCurrentUser);

  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  const resetAuthState = useCallback(() => {
    queryClient.clear();
    setCurrentUser(null);
    setAuthed(false);
  }, [queryClient, setCurrentUser]);

  const clearClientAuthState = useCallback(() => {
    clearAuthSession(false);
    sessionStorage.clear();
    resetAuthState();
    setLoading(false);
  }, [resetAuthState]);

  const hydrateAuthSession = useCallback(async () => {
    const persistedSession = loadPersistedAuthSession();

    if (!persistedSession) {
      resetAuthState();
      setLoading(false);
      return;
    }

    setCurrentUser(persistedSession.user ?? null);

    try {
      await refreshAuthSession();
      setAuthed(true);
    } catch (error) {
      if (shouldClearPersistedAuth(error)) {
        clearAuthSession(false);
      }

      resetAuthState();
    } finally {
      setLoading(false);
    }
  }, [resetAuthState, setCurrentUser]);

  useEffect(() => {
    hydrateAuthSession();
  }, [hydrateAuthSession]);

  useEffect(() => {
    return subscribeAuthSession((snapshot) => {
      if (!snapshot) {
        resetAuthState();
        return;
      }

      setCurrentUser(snapshot.user ?? null);
      setAuthed(Boolean(snapshot.accessToken));
    });
  }, [resetAuthState, setCurrentUser]);

  return {
    authed,
    loading,
    login(session: LoginResponse) {
      return new Promise<void>((resolve) => {
        setAuthSession({
          nextAccessToken: session.accessToken,
          nextRefreshToken: session.refreshToken,
          nextSessionId: session.sessionId,
          nextUser: session.user,
        });
        setCurrentUser(session.user);
        setAuthed(true);
        resolve();
      });
    },
    async logout() {
      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();

      clearClientAuthState();

      if (refreshToken) {
        void logoutRefreshSession(refreshToken, accessToken).catch(() => {
          // Local logout is already complete; a server-side failure should not block the user.
        });
      }
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function AuthConsumer(): AuthContext {
  const context = useContext(authContext);

  if (context === undefined) {
    throw new Error("AuthConsumer must be used within an AuthProvider");
  }

  return context;
}

export default AuthConsumer;
