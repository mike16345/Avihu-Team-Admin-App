import { DirtyFormProvider } from "@/context/useFormContext";
import { FC, PropsWithChildren } from "react";

const DietPlanWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <DirtyFormProvider>{children}</DirtyFormProvider>;
};

export default DietPlanWrapper;
