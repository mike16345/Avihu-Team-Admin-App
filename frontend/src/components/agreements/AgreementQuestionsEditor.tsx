import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import Question from "@/components/dynamicForms/question/Question";
import { DragDropWrapper } from "@/components/Wrappers/DragDropWrapper";
import { SortableItem } from "@/components/DragAndDrop/SortableItem";
import AddButton from "@/components/ui/buttons/AddButton";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { toast } from "sonner";
import { IFormQuestion } from "@/interfaces/IForm";

type AgreementFormValues = {
  name: string;
  type: string;
  repeatMonthly: boolean;
  showOn?: Date;
  sections: Array<{
    title: string;
    description?: string;
    questions: IFormQuestion[];
  }>;
};

type QuestionWithUiId = IFormQuestion & { rhfId?: string };

interface AgreementQuestionsEditorProps {
  questions: IFormQuestion[];
  onChange: (questions: IFormQuestion[]) => void;
}

const isValidObjectId = (value?: string) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

const stripUiFields = (questions: QuestionWithUiId[]): IFormQuestion[] => {
  return questions.map((question) => {
    const normalizedQuestion = { ...question };
    delete normalizedQuestion.rhfId;

    const { _id, ...questionWithoutId } = normalizedQuestion;
    if (_id && !isValidObjectId(_id)) {
      return questionWithoutId;
    }

    return _id ? { ...questionWithoutId, _id } : questionWithoutId;
  });
};

const serializeQuestions = (questions: Array<IFormQuestion | QuestionWithUiId>) => {
  return JSON.stringify(
    questions.map((question) => {
      if ("rhfId" in question) {
        const normalizedQuestion = { ...question };
        delete normalizedQuestion.rhfId;
        return normalizedQuestion;
      }
      return question;
    })
  );
};

const buildDefaultValues = (questions: IFormQuestion[]): AgreementFormValues => {
  return {
    name: "",
    type: "general",
    repeatMonthly: false,
    sections: [
      {
        title: "",
        description: "",
        questions,
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
    keyName: "rhfId",
  });

  const watchedQuestions =
    (useWatch({
      control,
      name: "sections.0.questions",
    }) as IFormQuestion[]) ?? [];

  const questionsForDnd = formQuestions.map((field, index) => ({
    ...(watchedQuestions[index] ?? field),
    rhfId: field.rhfId,
  }));

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
    const questionToCopy = watchedQuestions[index];

    if (!questionToCopy) return;

    const { options, ...newQuestion } = questionToCopy;
    delete (newQuestion as Partial<IFormQuestion>)._id;
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
      const updatedQuestions = (values.sections?.[0]?.questions ?? []) as QuestionWithUiId[];
      const sanitized = stripUiFields(updatedQuestions);
      const serialized = JSON.stringify(sanitized);

      if (serialized === lastEmittedQuestions.current) return;

      lastEmittedQuestions.current = serialized;
      onChange(sanitized);
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
        {questionsForDnd.length === 0 && (
          <p className="text-lg text-muted-foreground text-center ">אין שאלות</p>
        )}
        <DragDropWrapper
          items={questionsForDnd}
          strategy="vertical"
          idKey="rhfId"
          setItems={(items) =>
            replace(
              items.map((item) => {
                const itemWithoutRhfId = { ...item };
                delete itemWithoutRhfId.rhfId;
                return itemWithoutRhfId;
              })
            )
          }
        >
          {({ item, index }) => {
            return (
              <SortableItem
                key={item.rhfId}
                className="relative w-full bg-background"
                idKey="rhfId"
                item={item}
                dragHandleOnly
              >
                {({ dragHandleProps }) => (
                  <Question
                    parentPath={`sections.0.questions.${index}`}
                    onDeleteQuestion={() => onClickDeleteQuestion(index)}
                    onDuplicateQuestion={() => onDuplicateQuestion(index)}
                    dragHandleProps={dragHandleProps}
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
