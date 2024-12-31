import { AuthProvider } from "./useAuth";
import { useUsersApi } from "../api/useUsersApi";
import { PropsWithChildren } from "react";

const AuthProviderWrapper = ({ children }: PropsWithChildren) => {
  const { checkUserSessionToken } = useUsersApi();

  return <AuthProvider checkToken={checkUserSessionToken}>{children}</AuthProvider>;
};

export default AuthProviderWrapper;
