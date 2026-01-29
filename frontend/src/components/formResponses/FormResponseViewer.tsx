import { useEffect, useMemo, useState } from "react";
import { FormResponse } from "@/interfaces/IFormResponse";
import { FormTypesInHebrew } from "@/constants/form";
import DateUtils from "@/lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { FullscreenImage } from "@/components/UserDashboard/WeightProgression/FullscreenImage";
import CustomSelect from "../ui/CustomSelect";
import { buildPhotoUrl, convertItemsToOptions } from "@/lib/utils";
import { FormTypes } from "@/interfaces/IForm";

type FormResponseSection = FormResponse["sections"][number];
type FormResponseQuestion = FormResponseSection["questions"][number];

type FullscreenState = {
  images: string[];
  index: number;
};

type FormResponseViewerProps = {
  response: FormResponse;
  respondentName?: string;
  navigationMode?: "auto" | "tabs" | "select";
};

const formatSubmittedAt = (submittedAt?: string) => {
  if (!submittedAt) return "-";
  const parsedDate = new Date(submittedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return submittedAt;
  }
  return DateUtils.formatDate(parsedDate, "DD/MM/YYYY");
};

const isPrimitive = (value: unknown) => {
  return ["string", "number", "boolean"].includes(typeof value);
};

const normalizeFileUrls = (answer: unknown): string[] => {
  if (!answer) return [];
  const urls: string[] = [];

  if (typeof answer === "string") {
    urls.push(buildPhotoUrl(answer));
  }

  if (Array.isArray(answer)) {
    answer.forEach((entry) => urls.push(buildPhotoUrl(entry)));
  }

  return urls.filter((url) => typeof url === "string" && url.trim().length > 0);
};

const renderPrimitive = (value: unknown) => {
  if (value === null || value === undefined) {
    return <span>-</span>;
  }

  const stringValue = String(value);
  return <span className="whitespace-pre-wrap break-words">{stringValue || "-"}</span>;
};

const renderObjectDetails = (value: Record<string, unknown>) => {
  const entries = Object.entries(value);
  if (!entries.length) {
    return <span className="text-muted-foreground">-</span>;
  }

  const hasOnlyPrimitives = entries.every(([, entryValue]) => {
    return entryValue === null || entryValue === undefined || isPrimitive(entryValue);
  });

  if (hasOnlyPrimitives) {
    return (
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {entries.map(([key, entryValue]) => (
          <div key={key} className="rounded-md border border-muted/50 p-2">
            <dt className="text-xs text-muted-foreground">{key}</dt>
            <dd className="mt-1 font-medium">{renderPrimitive(entryValue)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="details">
        <AccordionTrigger className="text-sm">צפה בפרטים</AccordionTrigger>
        <AccordionContent>
          <pre className="max-w-full whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-xs sm:text-sm overflow-x-auto">
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
  const { answer, type } = question;

  if (type === "file-upload") {
    const urls = normalizeFileUrls(answer);

    if (!urls.length) {
      return <span className="text-muted-foreground">קובץ לא זמין</span>;
    }

    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {urls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => onImageSelect(urls, index)}
            className="group relative overflow-hidden rounded-lg border border-muted/60 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <img
              src={url}
              alt={`העלאת קובץ: ${question.question}`}
              className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-105 sm:h-32"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    );
  }

  if (isPrimitive(answer)) {
    return renderPrimitive(answer);
  }

  if (Array.isArray(answer)) {
    if (!answer.length) {
      return <span className="text-muted-foreground">-</span>;
    }

    const allPrimitive = answer.every(
      (item) => item === null || item === undefined || isPrimitive(item)
    );

    if (allPrimitive) {
      return (
        <ul className="list-disc space-y-1 pr-5 text-sm">
          {answer.map((item, index) => (
            <li key={`${String(item)}-${index}`}>{renderPrimitive(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <Accordion type="single" collapsible>
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm">צפה בפרטים</AccordionTrigger>
          <AccordionContent>
            <pre className="max-w-full whitespace-pre-wrap break-words rounded-md bg-muted p-3 text-xs sm:text-sm overflow-x-auto">
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

  return renderPrimitive(answer);
};

const getSectionLabel = (title: string | undefined, index: number) => {
  const trimmed = title?.trim();
  return trimmed ? trimmed : `סעיף ${index + 1}`;
};

const Metadata = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="space-y-1 text-right">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
};
const FormResponseViewer = ({
  response,
  respondentName,
  navigationMode = "auto",
}: FormResponseViewerProps) => {
  const sections = response.sections ?? [];
  const isMobile = useIsMobile();

  const [activeSectionId, setActiveSectionId] = useState(sections[0]?._id ?? "");
  const [fullscreenState, setFullscreenState] = useState<FullscreenState | null>(null);

  const formName = response.formTitle ?? response.formId?.name ?? "-";
  const rawFormType = response.formType ?? response.formId?.type;
  const formType = rawFormType ? (FormTypesInHebrew[rawFormType as FormTypes] ?? rawFormType) : "-";
  const submittedAt = formatSubmittedAt(response.submittedAt);
  console.log("Response:", respondentName);
  const displayRespondent = respondentName?.trim() || response.userId || "משתמש לא ידוע";
  const showSelect = navigationMode === "select" || (navigationMode === "auto" && isMobile);
  const showTabs = navigationMode === "tabs" || (navigationMode === "auto" && !isMobile);

  const sectionOptions = useMemo(() => {
    return convertItemsToOptions(sections, "title", "_id");
  }, [sections]);

  const activeSection = useMemo(() => {
    if (!sections.length) return undefined;
    return sections.find((section) => section._id === activeSectionId) ?? sections[0];
  }, [sections, activeSectionId]);

  const activeSectionIndex = useMemo(() => {
    if (!activeSection) return -1;
    return sections.findIndex((section) => section._id === activeSection._id);
  }, [activeSection, sections]);

  useEffect(() => {
    setActiveSectionId(sections[0]?._id ?? "");
    setFullscreenState(null);
  }, [response._id, sections.length]);

  return (
    <div className="flex flex-col gap-4 p-4" dir="rtl">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg sm:text-xl">פרטי תשובה</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Metadata label="שם הטופס" value={formName} />
          <Metadata label="סוג הטופס" value={formType} />
          <Metadata label="משיב" value={displayRespondent} />
          <Metadata label="נשלח בתאריך" value={submittedAt} />
        </CardContent>
      </Card>

      {sections.length ? (
        <div className="flex flex-col gap-3">
          {sections.length > 1 && showSelect && (
            <CustomSelect
              items={sectionOptions}
              selectedValue={activeSectionId}
              onValueChange={setActiveSectionId}
              placeholder="בחר סעיף"
              className="w-full sm:max-w-xs"
            />
          )}

          {sections.length > 1 && showTabs && (
            <Tabs
              value={activeSectionId}
              onValueChange={setActiveSectionId}
              dir="rtl"
              className="w-fit"
            >
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 overflow-x-auto">
                {sections.map((section, index) => (
                  <TabsTrigger key={section._id} value={section._id}>
                    {getSectionLabel(section.title, index)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {activeSection
                  ? getSectionLabel(
                      activeSection.title,
                      activeSectionIndex > -1 ? activeSectionIndex : 0
                    )
                  : "פרטי סעיף"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSection?.questions?.length ? (
                activeSection.questions.map((question, index) => (
                  <div
                    key={question._id || `${question.question}-${index}`}
                    className="rounded-lg border border-muted/60 bg-background/60 p-4 text-right shadow"
                  >
                    <p className="text-base font-semibold">{question.question}</p>
                    <div className="text-sm text-muted-foreground leading-6">
                      {renderQuestionAnswer(question, (images, selectedIndex) =>
                        setFullscreenState({ images, index: selectedIndex })
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">אין שאלות זמינות בסעיף זה.</div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-sm text-muted-foreground">אין סעיפים בתשובה זו.</div>
      )}
      {fullscreenState && (
        <FullscreenImage
          img={fullscreenState.images[fullscreenState.index]}
          onClose={() => setFullscreenState(null)}
          onArrowPress={(direction) => {
            const delta = direction === "next" ? 1 : -1;
            const nextIndex = fullscreenState.index + delta;
            if (nextIndex < 0 || nextIndex >= fullscreenState.images.length) return;
            setFullscreenState({ images: fullscreenState.images, index: nextIndex });
          }}
          isNext={fullscreenState.index < fullscreenState.images.length - 1}
          isPrevious={fullscreenState.index > 0}
        />
      )}
    </div>
  );
};

export default FormResponseViewer;
