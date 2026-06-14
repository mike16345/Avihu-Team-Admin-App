import { FaImage } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FormResponseQuestion } from "./formResponseViewerTypes";
import { normalizeFileUrls } from "./formResponseViewerUtils";

const isPrimitive = (value: unknown) => ["string", "number", "boolean"].includes(typeof value);

const renderPrimitive = (value: unknown) => {
  if (value === null || value === undefined)
    return <span className="text-slate-400 dark:text-slate-500">—</span>;

  const s = String(value);

  return <span className="whitespace-pre-wrap break-words">{s || "—"}</span>;
};

const renderObjectDetails = (value: Record<string, unknown>) => {
  const entries = Object.entries(value);

  if (!entries.length) return <span className="text-slate-400 dark:text-slate-500">—</span>;
  const onlyPrimitives = entries.every(([, v]) => v === null || v === undefined || isPrimitive(v));

  if (onlyPrimitives)
    return (
      <dl className="grid gap-2 sm:grid-cols-2">
        {entries.map(([key, v]) => (
          <div
            key={key}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 px-3 py-2"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {key}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">
              {renderPrimitive(v)}
            </dd>
          </div>
        ))}
      </dl>
    );

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="details" className="border-none">
        <AccordionTrigger className="text-sm font-semibold text-blue-700 dark:text-blue-300 hover:no-underline">
          צפה בפרטים הגולמיים
        </AccordionTrigger>
        <AccordionContent>
          <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-700 dark:text-slate-200">
            {JSON.stringify(value, null, 2)}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const renderQuestionAnswer = (
  question: FormResponseQuestion,
  onImageSelect: (images: string[], index: number) => void
) => {
  const { answer, type, question: questionLabel } = question;

  if (type === "file-upload") {
    const urls = normalizeFileUrls(answer);

    if (!urls.length) {
      return (
        <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
          <FaImage size={13} />
          קובץ לא זמין
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {urls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => onImageSelect(urls, index)}
            className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 transition-all hover:border-blue-300 hover:shadow-md"
          >
            <img
              src={url}
              alt={`${questionLabel} (${index + 1})`}
              className="aspect-[3/4] w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
              <span className="mb-2 rounded-full bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                לחץ להגדלה
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (isPrimitive(answer)) {
    return (
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {renderPrimitive(answer)}
      </div>
    );
  }

  if (Array.isArray(answer)) {
    if (!answer.length)
      return <span className="text-sm text-slate-400 dark:text-slate-500">—</span>;

    const allPrimitive = answer.every(
      (item) => item === null || item === undefined || isPrimitive(item)
    );

    if (allPrimitive) {
      return (
        <ul className="flex flex-wrap gap-1.5">
          {answer.map((item, index) => (
            <li
              key={`${String(item)}-${index}`}
              className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-100"
            >
              {renderPrimitive(item)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="details" className="border-none">
          <AccordionTrigger className="text-sm font-semibold text-blue-700 dark:text-blue-300 hover:no-underline">
            צפה בפרטים
          </AccordionTrigger>
          <AccordionContent>
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-700 dark:text-slate-200">
              {JSON.stringify(answer, null, 2)}
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  if (answer && typeof answer === "object") {
    return renderObjectDetails(answer as Record<string, unknown>);
  }

  return (
    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
      {renderPrimitive(answer)}
    </div>
  );
};

type FormResponseAnswerProps = {
  question: FormResponseQuestion;
  onImageSelect: (images: string[], index: number) => void;
};

export function FormResponseAnswer({ question, onImageSelect }: FormResponseAnswerProps) {
  return <>{renderQuestionAnswer(question, onImageSelect)}</>;
}
