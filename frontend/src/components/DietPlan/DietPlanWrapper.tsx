import { DirtyFormProvider } from "@/context/useFormContext";
import { FC, PropsWithChildren } from "react";

interface DietPlanWrapperProps extends PropsWithChildren {}

const DietPlanWrapper: FC<DietPlanWrapperProps> = ({ children }) => {
  return <DirtyFormProvider>{children}</DirtyFormProvider>;
};

export default DietPlanWrapper;
