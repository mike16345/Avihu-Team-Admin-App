import React from "react";
import { Button } from "./button";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

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

  return (
    <Button
      className={`${
        fixedPosition && `absolute top-5 left-12`
      } group hover:bg-primary transition-colors duration-500`}
      variant="secondary"
      onClick={variant === `navigation` ? () => navigate(navLink) : handleClick}
      data-testid="nav-back-button"
    >
      <span className="group-hover:text-background transition-colors duration-500">
        {variant === `navigation` ? <IoArrowBackCircleOutline size={30} /> : `בטל`}
      </span>
    </Button>
  );
};

export default BackButton;
