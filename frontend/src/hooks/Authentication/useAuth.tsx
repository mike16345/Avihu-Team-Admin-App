import { USER_TOKEN_STORAGE_KEY } from "@/constants/constants";
import { useEffect, useState, useContext, createContext } from "react";
import secureLocalStorage from "react-secure-storage";
import useCheckUserSessionQuery from "../queries/auth/useCheckUserSessionQuery";
import { ISession } from "@/interfaces/IUser";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/enums/QueryKeys";

interface AuthContext {
  authed: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const authContext = createContext<AuthContext | undefined>(undefined);

function useAuth(): AuthContext {
  const queryClient = useQueryClient();

  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<ISession | null>(null);

  const { data } = useCheckUserSessionQuery(token);

  const checkUserToken = () => {
    const userToken = secureLocalStorage.getItem(USER_TOKEN_STORAGE_KEY);

    if (!userToken || userToken === "undefined") {
      setAuthed(false);
      setLoading(false);
    } else {
      setToken(userToken as ISession);
    }
  };

  useEffect(() => {
    checkUserToken();
  }, []);

  useEffect(() => {
    if (!data) return;

    setAuthed(data.isValid);
    setLoading(false);
  }, [data]);

  return {
    authed,
    loading,
    login() {
      return new Promise<void>((resolve) => {
        setAuthed(true);
        resolve();
      });
    },
    logout() {
      return new Promise<void>((resolve) => {
        secureLocalStorage.clear();
        sessionStorage.clear();
        queryClient.invalidateQueries({ queryKey: [QueryKeys.USER_LOGIN_SESSION] });
        setAuthed(false);
        resolve();
      });
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
