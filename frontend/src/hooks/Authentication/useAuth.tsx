import { USER_TOKEN_STORAGE_KEY } from "@/constants/constants";
import { useEffect, useState, useContext, createContext } from "react";
import secureLocalStorage from "react-secure-storage";

interface AuthContext {
  authed: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

type CheckToken = (token: any) => Promise<any>;

const authContext = createContext<AuthContext | undefined>(undefined);

function useAuth(checkToken?: CheckToken): AuthContext {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkUserToken = () => {
    const userToken = secureLocalStorage.getItem(USER_TOKEN_STORAGE_KEY);

    if (!userToken || userToken === "undefined") {
      setAuthed(false);
    } else {
      setAuthed(true);
      checkToken?.(userToken);
    }
  };

  useEffect(() => {
    checkUserToken();
    setTimeout(() => setLoading(false), 1000);
  }, []);

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
        setAuthed(false);
        resolve();
      });
    },
  };
}

export function AuthProvider({
  children,
  checkToken,
}: {
  children: React.ReactNode;
  checkToken?: CheckToken;
}) {
  const auth = useAuth(checkToken);

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
