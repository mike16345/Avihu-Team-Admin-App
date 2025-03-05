import React from "react";
import { Button, ButtonProps } from "./button";
import Loader from "./Loader";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonProps {
  title: string;
  isLoading?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, disabled, isLoading, ...props }) => {
  return (
    <Button {...props} disabled={isLoading || disabled}>
      {isLoading ? <Loader variant="button" /> : title}
    </Button>
  );
};

export default CustomButton;
