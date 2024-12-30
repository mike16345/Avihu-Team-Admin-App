import { ReactNode } from "react";
import useAuth from "./useAuth";
import { useLocation } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Loader from "@/components/ui/Loader";

interface RequireAuthProps {
  children: ReactNode;
}

function RequireAuth({ children }: RequireAuthProps) {
  const { authed, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader variant="standard" />;

  return (
    <>{authed ? children : <Navigate to="/login" replace state={{ path: location.pathname }} />}</>
  );
}

export default RequireAuth;
