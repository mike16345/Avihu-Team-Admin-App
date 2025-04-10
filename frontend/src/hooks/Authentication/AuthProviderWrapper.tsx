import { AuthProvider } from "./useAuth";
import { PropsWithChildren } from "react";

const AuthProviderWrapper = ({ children }: PropsWithChildren) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AuthProviderWrapper;
