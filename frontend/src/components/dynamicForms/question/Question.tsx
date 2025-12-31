import React from "react";
import QuestionActions from "./QuestionActions";
import QuestionForm from "./QuestionForm";

interface QuestionProps {
  parentPath: `sections.${number}.questions.${number}`;
  onDeleteQuestion: () => void;
  onDuplicateQuestion: () => void;
}

const Question: React.FC<QuestionProps> = ({
  parentPath,
  onDeleteQuestion,
  onDuplicateQuestion,
}) => {
  return (
    <div className="border rounded-xl hover:shadow hover:border-primary transition-all p-5 group flex justify-between gap-5">
      <QuestionForm parentPath={parentPath} />

      <div className="opacity-0 group-hover:opacity-100 transition-all">
        <QuestionActions
          onDeleteQuestion={onDeleteQuestion}
          onDuplicateQuestion={onDuplicateQuestion}
        />
      </div>
    </div>
  );
};

export default Question;
