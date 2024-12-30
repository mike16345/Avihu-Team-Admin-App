import React from "react";
import { Button, ButtonProps } from "./button";
import Loader from "./Loader";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonProps {
  title: string;
  isLoading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, isLoading, ...props }) => {
  return (
    <Button {...props} disabled={isLoading}>
      {isLoading ? <Loader variant="button" /> : title}
    </Button>
  );
};

export default CustomButton;
