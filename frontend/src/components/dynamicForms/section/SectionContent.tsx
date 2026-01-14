import React, { useRef, useState } from "react";
import Question from "../question/Question";
import { DragDropWrapper } from "@/components/Wrappers/DragDropWrapper";
import { FormType } from "@/schemas/formBuilderSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IFormQuestion } from "@/interfaces/IForm";
import { generateUUID } from "@/lib/utils";
import { SortableItem } from "@/components/DragAndDrop/SortableItem";
import AddButton from "@/components/ui/buttons/AddButton";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { toast } from "sonner";

interface SectionContentProps {
  parentPath: `sections.${number}`;
}

const SectionContent: React.FC<SectionContentProps> = ({ parentPath }) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<FormType>();
  const sectionIndex = Number(parentPath.split(".")[1]);
  const questionsError = errors.sections?.[sectionIndex]?.questions?.root?.message;

  const { replace, append, remove } = useFieldArray({
    control,
    name: `${parentPath}.questions`,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const questionIndex = useRef<number | null>(null);
  const questions = watch(`${parentPath}.questions`) as IFormQuestion[];

  const handleAddQuestion = () => {
    const newQuestion: IFormQuestion = {
      question: "",
      required: false,
      type: "text",
      _id: generateUUID(),
    };

    append(newQuestion);
  };

  /* ---------- Actions ---------- */

  const onClickDeleteQuestion = (index: number) => {
    questionIndex.current = index;
    setIsDeleteModalOpen(true);
  };

  const onDuplicateQuestion = (index: number) => {
    questionIndex.current = index;
    const questionToCopy = questions[index];
    const { _id, ...newSection } = questionToCopy;

    append({ _id: generateUUID(), ...newSection });
  };

  const onConfirmDeleteQuestion = () => {
    if (questionIndex.current == null) return;

    remove(questionIndex.current);
    questionIndex.current = null;
    toast.success("שאלה נמחקה בהצלחה!");
  };

  return (
    <>
      <div className="p-5 space-y-5">
        <DragDropWrapper items={questions} strategy="vertical" idKey="_id" setItems={replace}>
          {({ item, index }) => {
            return (
              <SortableItem className="relative w-full bg-background" idKey="_id" item={item}>
                {() => (
                  <Question
                    key={item._id}
                    parentPath={`${parentPath}.questions.${index}`}
                    onDeleteQuestion={() => onClickDeleteQuestion(index)}
                    onDuplicateQuestion={() => onDuplicateQuestion(index)}
                  />
                )}
              </SortableItem>
            );
          }}
        </DragDropWrapper>

        {questionsError && <p className="text-sm text-destructive font-medium">{questionsError}</p>}

        <AddButton onClick={handleAddQuestion} label="הוסף שאלה" />
      </div>

      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={onConfirmDeleteQuestion}
      />
    </>
  );
};

export default SectionContent;
