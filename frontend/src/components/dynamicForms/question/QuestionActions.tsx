import CopyButton from "@/components/ui/buttons/CopyButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import { RxDragHandleDots2 } from "react-icons/rx";
import React from "react";

const QuestionActions = () => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-center">
        <RxDragHandleDots2 />
      </div>
      <CopyButton onClick={() => {}} tip="שכפל שאלה" />
      <DeleteButton onClick={() => {}} tip="מחק שאלה" />
    </div>
  );
};

export default QuestionActions;
