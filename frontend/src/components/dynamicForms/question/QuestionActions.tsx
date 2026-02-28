import CopyButton from "@/components/ui/buttons/CopyButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import React from "react";
import { RxDragHandleDots2 } from "react-icons/rx";

interface QuestionActionsProps {
  onDeleteQuestion: () => void;
  onDuplicateQuestion: () => void;
  dragHandleProps?: any;
}

const QuestionActions: React.FC<QuestionActionsProps> = ({
  onDeleteQuestion,
  onDuplicateQuestion,
  dragHandleProps,
}) => {
  return (
    <div className="flex md:flex-col gap-1 items-center">
      <button
        type="button"
        className="flex justify-center cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
        aria-label="גרור שאלה"
        {...dragHandleProps}
      >
        <RxDragHandleDots2 />
      </button>
      <CopyButton onClick={onDuplicateQuestion} tip="שכפל שאלה" />
      <DeleteButton onClick={onDeleteQuestion} tip="מחק שאלה" />
    </div>
  );
};

export default QuestionActions;
