import CopyButton from "@/components/ui/buttons/CopyButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import { RxDragHandleDots2 } from "react-icons/rx";
import React from "react";

interface QuestionActionsProps {
  onDeleteQuestion: () => void;
  onDuplicateQuestion: () => void;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({
  onDeleteQuestion,
  onDuplicateQuestion,
}) => {
  return (
    <div className="flex md:flex-col gap-1 items-center">
      <div className="flex justify-center">
        <RxDragHandleDots2 />
      </div>
      <CopyButton onClick={onDuplicateQuestion} tip="שכפל שאלה" />
      <DeleteButton onClick={onDeleteQuestion} tip="מחק שאלה" />
    </div>
  );
};

export default QuestionActions;
