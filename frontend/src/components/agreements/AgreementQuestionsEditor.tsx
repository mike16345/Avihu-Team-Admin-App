import { useEffect, useRef, useState } from "react";
import { generateUUID } from "@/lib/utils";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import Question from "@/components/dynamicForms/question/Question";
import { DragDropWrapper } from "@/components/Wrappers/DragDropWrapper";
import { SortableItem } from "@/components/DragAndDrop/SortableItem";
import AddButton from "@/components/ui/buttons/AddButton";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { toast } from "sonner";
import { FormQuestionType } from "@/schemas/formBuilderSchema";

type AgreementFormValues = {
  name: string;
  type: string;
  repeatMonthly: boolean;
  showOn?: Date;
  sections: Array<{
    title: string;
    description?: string;
    questions: FormQuestionType[];
  }>;
};

type QuestionWithId = FormQuestionType & { _id: string };

interface AgreementQuestionsEditorProps {
  questions: FormQuestionType[];
  onChange: (questions: FormQuestionType[]) => void;
}

const ensureQuestionIds = (
  questions: Array<FormQuestionType | QuestionWithId>
): QuestionWithId[] => {
  return questions.map((question) => {
    if ("_id" in question && typeof question._id === "string") {
      return question as QuestionWithId;
    }

    return { _id: generateUUID(), ...question };
  });
};

const stripQuestionIds = (questions: QuestionWithId[]): FormQuestionType[] => {
  return questions.map(({ _id, ...question }) => question);
};

const serializeQuestions = (questions: Array<FormQuestionType | QuestionWithId>) => {
  return JSON.stringify(
    questions.map((question) => {
      if ("_id" in question) {
        const { _id, ...rest } = question;
        return rest;
      }
      return question;
    })
  );
};

const buildDefaultValues = (questions: FormQuestionType[]): AgreementFormValues => {
  const baseQuestions = questions;
  return {
    name: "",
    type: "general",
    repeatMonthly: false,
    sections: [
      {
        title: "",
        description: "",
        questions: ensureQuestionIds(baseQuestions),
      },
    ],
  };
};

const AgreementQuestionsEditor = ({ questions, onChange }: AgreementQuestionsEditorProps) => {
  const form = useForm<AgreementFormValues>({
    defaultValues: buildDefaultValues(questions),
    mode: "onChange",
  });
  const { control, reset } = form;

  const {
    fields: formQuestions,
    append,
    insert,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: "sections.0.questions",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const questionIndex = useRef<number | null>(null);

  const lastEmittedQuestions = useRef<string>(serializeQuestions(questions));

  const handleAddQuestion = () => {
    append({
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
    if (!formQuestions) return;
    const questionToCopy = formQuestions[index];

    if (!questionToCopy) return;

    const { options, ...newQuestion } = questionToCopy;
    insert(index + 1, {
      ...newQuestion,
      options: Array.isArray(options) ? [...options] : options,
    });
  };

  const onConfirmDeleteQuestion = () => {
    if (questionIndex.current == null) return;
    remove(questionIndex.current);
    questionIndex.current = null;
    toast.success("שאלה נמחק בהצלחה");
  };

  useEffect(() => {
    const subscription = form.watch((values) => {
      const updatedQuestions = (values.sections?.[0]?.questions ?? []) as QuestionWithId[];
      const serialized = JSON.stringify(stripQuestionIds(updatedQuestions));

      if (serialized === lastEmittedQuestions.current) return;

      lastEmittedQuestions.current = serialized;
      onChange(stripQuestionIds(updatedQuestions));
    });

    return () => subscription.unsubscribe();
  }, [form, onChange]);

  useEffect(() => {
    const serialized = serializeQuestions(questions);

    if (serialized === lastEmittedQuestions.current) return;

    lastEmittedQuestions.current = serialized;
    reset(buildDefaultValues(questions));
  }, [questions, reset]);

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        {formQuestions.length === 0 && (
          <p className="text-lg text-muted-foreground text-center ">אין שאלות</p>
        )}
        <DragDropWrapper items={formQuestions} strategy="vertical" idKey="id" setItems={replace}>
          {({ item, index }) => {
            return (
              <SortableItem className="relative w-full bg-background" idKey="id" item={item}>
                {() => (
                  <Question
                    key={item.id}
                    parentPath={`sections.0.questions.${index}`}
                    onDeleteQuestion={() => onClickDeleteQuestion(index)}
                    onDuplicateQuestion={() => onDuplicateQuestion(index)}
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
