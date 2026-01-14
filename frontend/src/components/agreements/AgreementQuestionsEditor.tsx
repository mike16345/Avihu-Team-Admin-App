import { AgreementQuestionDefinition, AgreementQuestionType } from "@/interfaces/IAgreement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CustomSelect from "@/components/ui/CustomSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { generateUUID } from "@/lib/utils";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

const QUESTION_TYPE_OPTIONS = [
  { name: "טקסט קצר", value: "text" },
  { name: "טקסט ארוך", value: "textarea" },
  { name: "בחירה יחידה", value: "single-select" },
  { name: "בחירה מרובה", value: "multi-select" },
];

const QUESTION_TYPES_WITH_OPTIONS: AgreementQuestionType[] = ["single-select", "multi-select"];

interface AgreementQuestionsEditorProps {
  questions: AgreementQuestionDefinition[];
  onChange: (questions: AgreementQuestionDefinition[]) => void;
}

const AgreementQuestionsEditor = ({ questions, onChange }: AgreementQuestionsEditorProps) => {
  const handleAddQuestion = () => {
    onChange([
      ...questions,
      {
        questionId: generateUUID(),
        label: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<AgreementQuestionDefinition>) => {
    const next = [...questions];
    next[index] = { ...next[index], ...updates };
    if (!QUESTION_TYPES_WITH_OPTIONS.includes(next[index].type)) {
      next[index].options = [];
    }
    onChange(next);
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const next = [...questions];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next);
  };

  const handleRemoveQuestion = (index: number) => {
    onChange(questions.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <p className="text-sm text-muted-foreground">עדיין לא נוספו שאלות להסכם.</p>
      )}
      {questions.map((question, index) => {
        const optionsText = (question.options || []).join("\n");
        return (
          <div key={question.questionId} className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">שאלה #{index + 1}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleMoveQuestion(index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleMoveQuestion(index, "down")}
                  disabled={index === questions.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Input
              placeholder="טקסט השאלה"
              value={question.label}
              onChange={(event) => handleUpdateQuestion(index, { label: event.target.value })}
            />
            <div className="flex flex-wrap gap-4 items-center">
              <div className="min-w-[200px]">
                <CustomSelect
                  items={QUESTION_TYPE_OPTIONS}
                  selectedValue={question.type}
                  onValueChange={(value) =>
                    handleUpdateQuestion(index, { type: value as AgreementQuestionType })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={question.required}
                  onCheckedChange={(checked) =>
                    handleUpdateQuestion(index, { required: Boolean(checked) })
                  }
                />
                שדה חובה
              </label>
            </div>
            {QUESTION_TYPES_WITH_OPTIONS.includes(question.type) && (
              <Textarea
                placeholder="אפשרויות תשובה - כל אפשרות בשורה חדשה"
                value={optionsText}
                onChange={(event) =>
                  handleUpdateQuestion(index, {
                    options: event.target.value
                      .split("\n")
                      .map((option) => option.trim())
                      .filter(Boolean),
                  })
                }
                rows={4}
              />
            )}
          </div>
        );
      })}
      <Button variant="outline" onClick={handleAddQuestion}>
        הוסף שאלה
      </Button>
    </div>
  );
};

export default AgreementQuestionsEditor;
