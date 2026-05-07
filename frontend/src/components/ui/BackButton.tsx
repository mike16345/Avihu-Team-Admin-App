import React from "react";
import { Button } from "./button";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  navLink: string;
  variant?: `navigation` | `cancel`;
  handleClick?: () => void;
  fixedPosition?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  navLink,
  variant = `navigation`,
  handleClick,
  fixedPosition = true,
}) => {
  const navigate = useNavigate();
  const canGoBack =
    typeof window !== "undefined" &&
    typeof window.history !== "undefined" &&
    typeof window.history.state?.idx === "number" &&
    window.history.state.idx > 0;

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }
    navigate(navLink);
  };

  return (
    <Button
      data-testid="back-button"
      className={cn(
        fixedPosition ? "absolute left-12 top-5" : "",
        "group transition-colors duration-500 hover:bg-primary"
      )}
      variant="secondary"
      onClick={variant === `navigation` ? handleBack : handleClick}
    >
      <span className="group-hover:text-background transition-colors duration-500">
        {variant === `navigation` ? <IoArrowBackCircleOutline size={30} /> : `בטל`}
      </span>
    </Button>
  );
};

export default BackButton;
