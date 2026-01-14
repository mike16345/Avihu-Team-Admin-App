import { useEffect, useMemo, useRef, useState } from "react";
import { AgreementQuestionDefinition, AgreementQuestionType } from "@/interfaces/IAgreement";
import { generateUUID } from "@/lib/utils";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import Question from "@/components/dynamicForms/question/Question";
import { DragDropWrapper } from "@/components/Wrappers/DragDropWrapper";
import { SortableItem } from "@/components/DragAndDrop/SortableItem";
import AddButton from "@/components/ui/buttons/AddButton";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { toast } from "sonner";
import { Option } from "@/types/types";

const QUESTION_TYPE_OPTIONS: Option[] = [
  { name: "טקסט קצר", value: "text" },
  { name: "טקסט ארוך", value: "textarea" },
  { name: "בחירה יחידה", value: "single-select" },
  { name: "בחירה מרובה", value: "multi-select" },
];

const QUESTION_TYPES_WITH_OPTIONS: AgreementQuestionType[] = ["single-select", "multi-select"];

type AgreementFormQuestion = {
  _id: string;
  type: AgreementQuestionType;
  question: string;
  description?: string;
  options?: string[];
  required: boolean;
};

type AgreementFormValues = {
  name: string;
  type: string;
  repeatMonthly: boolean;
  showOn?: Date;
  sections: Array<{
    title: string;
    description?: string;
    questions: AgreementFormQuestion[];
  }>;
};

interface AgreementQuestionsEditorProps {
  questions: AgreementQuestionDefinition[];
  onChange: (questions: AgreementQuestionDefinition[]) => void;
}

const buildDefaultValues = (questions: AgreementQuestionDefinition[]): AgreementFormValues => {
  return {
    name: "",
    type: "general",
    repeatMonthly: false,
    sections: [
      {
        title: "",
        description: "",
        questions: questions.map((question) => ({
          _id: question.questionId,
          question: question.label,
          type: question.type,
          required: question.required,
          options: question.options ?? [],
          description: "",
        })),
      },
    ],
  };
};

const mapFormQuestionToAgreement = (
  question: AgreementFormQuestion
): AgreementQuestionDefinition => {
  return {
    questionId: question._id,
    label: question.question,
    type: question.type,
    required: question.required,
    options: question.options ?? [],
  };
};

const AgreementQuestionsEditor = ({ questions, onChange }: AgreementQuestionsEditorProps) => {
  const form = useForm<AgreementFormValues>({
    defaultValues: buildDefaultValues(questions),
    mode: "onChange",
  });
  const { control, reset } = form;

  const { append, remove, replace } = useFieldArray({
    control,
    name: "sections.0.questions",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const questionIndex = useRef<number | null>(null);

  const formQuestions = useWatch({
    control,
    name: "sections.0.questions",
  }) as AgreementFormQuestion[] | undefined;

  const lastEmittedQuestions = useRef<string>("");

  const questionsList = useMemo(() => formQuestions ?? [], [formQuestions]);

  const handleAddQuestion = () => {
    append({
      _id: generateUUID(),
      question: "",
      type: "text",
      required: false,
      options: [],
    });
  };

  const onClickDeleteQuestion = (index: number) => {
    questionIndex.current = index;
    setIsDeleteModalOpen(true);
  };

  const onDuplicateQuestion = (index: number) => {
    const questionToCopy = questionsList[index];
    if (!questionToCopy) return;
    const { _id, ...newQuestion } = questionToCopy;
    append({ _id: generateUUID(), ...newQuestion });
  };

  const onConfirmDeleteQuestion = () => {
    if (questionIndex.current == null) return;
    remove(questionIndex.current);
    questionIndex.current = null;
    toast.success("");
  };

  useEffect(() => {
    const mappedQuestions = (formQuestions ?? []).map(mapFormQuestionToAgreement);
    const serialized = JSON.stringify(mappedQuestions);

    if (serialized === lastEmittedQuestions.current) return;

    lastEmittedQuestions.current = serialized;
    onChange(mappedQuestions);
  }, [formQuestions, onChange]);

  useEffect(() => {
    const serialized = JSON.stringify(questions);

    if (serialized === lastEmittedQuestions.current) return;

    reset(buildDefaultValues(questions));
  }, [questions, reset]);

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        {questionsList.length === 0 && (
          <p className="text-lg text-muted-foreground text-center ">אין שאלות</p>
        )}
        <DragDropWrapper items={questionsList} strategy="vertical" idKey="_id" setItems={replace}>
          {({ item, index }) => {
            return (
              <SortableItem className="relative w-full bg-background" idKey="_id" item={item}>
                {() => (
                  <Question
                    key={item._id}
                    parentPath={`sections.0.questions.${index}`}
                    onDeleteQuestion={() => onClickDeleteQuestion(index)}
                    onDuplicateQuestion={() => onDuplicateQuestion(index)}
                    typeOptions={QUESTION_TYPE_OPTIONS}
                    typesRequiringOptions={QUESTION_TYPES_WITH_OPTIONS}
                  />
                )}
              </SortableItem>
            );
          }}
        </DragDropWrapper>

        <AddButton onClick={handleAddQuestion} label="הוסף שאלה" />
      </div>

      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={onConfirmDeleteQuestion}
      />
    </FormProvider>
  );
};

export default AgreementQuestionsEditor;
