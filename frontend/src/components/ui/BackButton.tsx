import React from "react";
import { Button } from "./button";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  navLink: string;
}

const BackButton: React.FC<BackButtonProps> = ({ navLink }) => {
  const navigate = useNavigate();

  return (
    <Button
      className="absolute top-5 left-12 group hover:bg-primary transition-colors duration-500"
      variant="secondary"
      onClick={() => navigate(navLink)}
    >
      <IoArrowBackCircleOutline
        size={30}
        className="group-hover:animate-bounce group-hover:text-background transition-colors duration-500"
      />
    </Button>
  );
};

export default BackButton;
