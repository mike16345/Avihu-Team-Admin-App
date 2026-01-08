import React from "react";
import QuestionActions from "./QuestionActions";
import QuestionForm from "./QuestionForm";
import { useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { borderColor } from "@/constants/form";

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
  const {
    formState: { errors },
  } = useFormContext<FormType>();
  const sectionIndex = Number(parentPath.split(".")[1]);
  const questionIndex = Number(parentPath.split(".")[3]);
  const questionError = errors.sections?.[sectionIndex]?.questions?.[questionIndex];

  return (
    <div
      className={`border rounded-xl hover:shadow hover:border-primary transition-all p-5 group flex flex-col-reverse md:flex-row justify-between gap-5 ${
        borderColor[!!questionError as any]
      }`}
    >
      <QuestionForm parentPath={parentPath} />

      <div>
        <QuestionActions
          onDeleteQuestion={onDeleteQuestion}
          onDuplicateQuestion={onDuplicateQuestion}
        />
      </div>
    </div>
  );
};

export default Question;
