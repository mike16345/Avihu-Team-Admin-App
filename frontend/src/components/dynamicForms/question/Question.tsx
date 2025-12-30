import { IFormQuestion } from "@/interfaces/IForm";
import React, { useState } from "react";
import DynamicInput from "../../ui/DynamicInput";
import QuestionActions from "./QuestionActions";
import CustomSelect from "@/components/ui/CustomSelect";
import { QuestionTypeOptions } from "@/constants/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import CustomSwitch from "@/components/ui/CustomSwitch";
import QuestionForm from "./QuestionForm";

const tempQuestion: IFormQuestion = { question: "", type: "text", required: false };

/* interface QuestionProps {
  question?: IFormQuestion;
} */

const Question /* : React.FC<QuestionProps> */ = () => {
  const [question, setQuestion] = useState(tempQuestion);

  return (
    <div className="border rounded-lg hover:shadow hover:border-primary transition-all p-5 group flex justify-between gap-5">
      <QuestionForm />

      <div className="opacity-0 group-hover:opacity-100 transition-all">
        <QuestionActions />
      </div>
    </div>
  );
};

export default Question;
