/**
 * FormResponseViewer — redesigned
 *
 * Modern, clean layout for a single questionnaire response:
 *  - Header card with respondent avatar, name, type badge, sent date
 *  - Sticky pill-style section tabs (or select on mobile)
 *  - Each question rendered as a card with a clean Q / A layout
 *  - File-upload answers shown as a polished image gallery (lightbox)
 *  - Empty / loading states handled
 *
 * Logic and data flow are unchanged.
 */
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormResponse } from "@/interfaces/IFormResponse";
import { FormTypesInHebrew } from "@/constants/form";
import { FormTypes } from "@/interfaces/IForm";
import DateUtils from "@/lib/dateUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FullscreenImage } from "@/components/UserDashboard/WeightProgression/FullscreenImage";
import CustomSelect from "../ui/CustomSelect";
import { buildPhotoUrl, convertItemsToOptions } from "@/lib/utils";
import { sendData } from "@/API/api";
import { ApiResponse } from "@/types/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaClipboardList, FaCalendarDay, FaImage, FaImages, FaCheck } from "react-icons/fa6";

/**
 * Extract storage keys for all file-upload answers in this response.
 * Storage keys are what the server stores in `userImageUrls.imageUrls[]`
 * (e.g. "userId/date/filename") — we strip any `/images/` prefix and the
 * CloudFront URL prefix because `buildPhotoUrl` adds them back when displaying.
 */
function extractAllPhotoKeys(response: FormResponse): string[] {
  const keys: string[] = [];
  const stripPrefix = (val: string): string | null => {
    if (!val || typeof val !== "string") return null;
    // If it's a full URL with /images/, take what's after.
    const idx = val.indexOf("/images/");
    if (idx >= 0) return val.slice(idx + "/images/".length);
    // Otherwise return as-is (already a storage key).
    return val.replace(/^\/+/, "");
  };
  (response.sections ?? []).forEach((section) => {
    (section.questions ?? []).forEach((q) => {
      if (q.type !== "file-upload" || !q.answer) return;
      const candidates: any[] = Array.isArray(q.answer) ? q.answer : [q.answer];
      candidates.forEach((c) => {
        if (typeof c === "string") {
          const k = stripPrefix(c);
          if (k) keys.push(k);
        }
      });
    });
  });
  return Array.from(new Set(keys));
}

type FormResponseSection = FormResponse["sections"][number];
type FormResponseQuestion = FormResponseSection["questions"][number];

type FullscreenState = { images: string[]; index: number };

type FormResponseViewerProps = {
  response: FormResponse;
  respondentName?: string;
  navigationMode?: "auto" | "tabs" | "select";
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

const formatSubmittedAt = (submittedAt?: string) => {
  if (!submittedAt) return "—";
  const d = new Date(submittedAt);
  if (Number.isNaN(d.getTime())) return submittedAt;
  return DateUtils.formatDate(d, "DD/MM/YYYY");
};

const isPrimitive = (v: unknown) => ["string", "number", "boolean"].includes(typeof v);

const normalizeFileUrls = (answer: unknown): string[] => {
  if (!answer) return [];
  const urls: string[] = [];
  if (typeof answer === "string") urls.push(buildPhotoUrl(answer));
  if (Array.isArray(answer)) answer.forEach((entry) => urls.push(buildPhotoUrl(entry)));
  return urls.filter((u) => typeof u === "string" && u.trim().length > 0);
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "?";

const TYPE_ACCENT: Record<string, { bg: string; text: string; ring: string }> = {
  start: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    ring: "ring-blue-200",
  },
  monthly: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200",
  },
  general: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-200",
    ring: "ring-slate-200",
  },
};
const accentOf = (type?: string) => TYPE_ACCENT[type || "general"] || TYPE_ACCENT.general;

const getSectionLabel = (title: string | undefined, index: number) =>
  title?.trim() || `סעיף ${index + 1}`;

/* ── answer renderers ────────────────────────────────────────────────────── */

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

  if (onlyPrimitives) {
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
  }

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

/* ── main component ─────────────────────────────────────────────────────── */

const FormResponseViewer = ({
  response,
  respondentName,
  navigationMode = "auto",
}: FormResponseViewerProps) => {
  const sections = response.sections ?? [];
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [activeSectionId, setActiveSectionId] = useState(sections[0]?._id ?? "");
  const [fullscreenState, setFullscreenState] = useState<FullscreenState | null>(null);
  const [importingPhotos, setImportingPhotos] = useState(false);
  const [importedThisSession, setImportedThisSession] = useState(false);

  // Photo keys found in any file-upload question in this response.
  const photoKeys = useMemo(() => extractAllPhotoKeys(response), [response]);

  /**
   * Add all file-upload images from this response into the trainee's
   * progress-photos gallery (`userImageUrls`). Uses the existing public
   * `POST /userImageUrls` endpoint — works without any server deploy.
   */
  const handleAddPhotosToGallery = async () => {
    const userIdValue =
      typeof response.userId === "string" ? response.userId : (response.userId as any)?._id;
    if (!userIdValue || photoKeys.length === 0) {
      toast.error("אין תמונות לייבא או חסר מזהה משתמש");
      return;
    }
    setImportingPhotos(true);
    let added = 0;
    let lastError: string | null = null;
    for (const key of photoKeys) {
      try {
        await sendData<ApiResponse<string[]>>("userImageUrls", {
          userId: userIdValue,
          imageUrl: key,
        });
        added++;
      } catch (e: any) {
        lastError = e?.message || "שגיאה לא ידועה";
      }
    }
    setImportingPhotos(false);
    if (added > 0) {
      // Refresh the trainee's photo gallery query if it's cached
      queryClient.invalidateQueries({ queryKey: [userIdValue + "-photos"] });
      setImportedThisSession(true);
      toast.success(
        added === photoKeys.length
          ? `${added} תמונות נוספו לגלריית התמונות של המתאמן`
          : `${added} מתוך ${photoKeys.length} תמונות נוספו · ${lastError || ""}`
      );
    } else {
      toast.error(lastError || "לא הצלחנו להוסיף את התמונות לגלריה");
    }
  };

  const formName = response.formTitle ?? response.formId?.name ?? "—";
  const rawFormType = response.formType ?? response.formId?.type;
  const typeLabel = rawFormType
    ? (FormTypesInHebrew[rawFormType as FormTypes] ?? rawFormType)
    : "—";
  const accent = accentOf(rawFormType as string | undefined);
  const submittedAt = formatSubmittedAt(response.submittedAt);
  const displayRespondent =
    respondentName?.trim() ||
    (typeof response.userId === "string" ? response.userId : "משתמש לא ידוע");

  const showSelect = navigationMode === "select" || (navigationMode === "auto" && isMobile);
  const showTabs = navigationMode === "tabs" || (navigationMode === "auto" && !isMobile);

  const sectionOptions = useMemo(() => convertItemsToOptions(sections, "title", "_id"), [sections]);

  const activeSection = useMemo(() => {
    if (!sections.length) return undefined;
    return sections.find((s) => s._id === activeSectionId) ?? sections[0];
  }, [sections, activeSectionId]);

  const activeSectionIndex = useMemo(() => {
    if (!activeSection) return -1;
    return sections.findIndex((s) => s._id === activeSection._id);
  }, [activeSection, sections]);

  // Total question count across all sections — shown in header for context
  const totalQuestions = useMemo(
    () => sections.reduce((acc, s) => acc + (s.questions?.length ?? 0), 0),
    [sections]
  );

  useEffect(() => {
    setActiveSectionId(sections[0]?._id ?? "");
    setFullscreenState(null);
  }, [response._id, sections.length]);

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-6 p-2"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Header card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          {/* Left: avatar + names */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-bold text-white shadow-sm">
              {initialsOf(displayRespondent)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <FaClipboardList size={11} />
                פרטי תשובה
              </div>
              <h1 className="mt-0.5 truncate text-xl font-bold text-slate-900 dark:text-slate-100">
                {displayRespondent}
              </h1>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{formName}</p>
            </div>
          </div>

          {/* Right: chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${accent.bg} ${accent.text} ${accent.ring}`}
            >
              {typeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              <FaCalendarDay size={10} className="text-slate-400 dark:text-slate-500" />
              {submittedAt}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 ring-1 ring-inset ring-slate-200">
              {totalQuestions} שאלות · {sections.length} סעיפים
            </span>
          </div>
        </div>

        {/* "Add photos to gallery" CTA — only when the response contains photos */}
        {photoKeys.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                <FaImages size={14} />
              </span>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {photoKeys.length} תמונות הועלו בשאלון
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  אפשר להוסיף אותן לגלריית תמונות ההתקדמות של המתאמן בלחיצה אחת
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddPhotosToGallery}
              disabled={importingPhotos || importedThisSession}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${
                importedThisSession
                  ? "cursor-default bg-emerald-600"
                  : importingPhotos
                    ? "cursor-not-allowed bg-blue-400"
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {importedThisSession ? (
                <>
                  <FaCheck size={11} />
                  נוספו לגלריה
                </>
              ) : importingPhotos ? (
                "מוסיף..."
              ) : (
                <>
                  <FaImages size={12} />
                  הוסף לגלריית התמונות
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Body — sections + questions */}
      {sections.length ? (
        <>
          {/* Section navigation */}
          {sections.length > 1 && showSelect && (
            <div className="sticky top-2 z-10 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 p-3 shadow-sm backdrop-blur-sm">
              <CustomSelect
                items={sectionOptions}
                selectedValue={activeSectionId}
                onValueChange={setActiveSectionId}
                placeholder="בחר סעיף"
                className="w-full"
              />
            </div>
          )}

          {sections.length > 1 && showTabs && (
            <div className="sticky top-2 z-10 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 p-1.5 shadow-sm backdrop-blur-sm">
              <div className="flex flex-wrap gap-1.5">
                {sections.map((section, index) => {
                  const isActive = section._id === (activeSection?._id ?? "");
                  return (
                    <button
                      key={section._id}
                      type="button"
                      onClick={() => setActiveSectionId(section._id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {getSectionLabel(section.title, index)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active section */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {activeSection
                  ? getSectionLabel(
                      activeSection.title,
                      activeSectionIndex > -1 ? activeSectionIndex : 0
                    )
                  : "פרטי סעיף"}
              </h2>
              {activeSection?.questions?.length ? (
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {activeSection.questions.length}{" "}
                  {activeSection.questions.length === 1 ? "שאלה" : "שאלות"}
                </span>
              ) : null}
            </div>

            {activeSection?.questions?.length ? (
              <div className="space-y-4">
                {activeSection.questions.map((question, index) => (
                  <article
                    key={question._id || `${question.question}-${index}`}
                    className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/40 p-5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                        {index + 1}
                      </span>
                      <p className="text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">
                        {question.question}
                      </p>
                    </div>
                    <div className="pr-9 leading-6">
                      {renderQuestionAnswer(question, (images, selectedIndex) =>
                        setFullscreenState({ images, index: selectedIndex })
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-8 text-center">
                <FaClipboardList size={24} className="text-slate-300" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  אין שאלות זמינות בסעיף זה.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
          <FaClipboardList size={28} className="text-slate-300" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            אין סעיפים בתשובה זו
          </p>
          <p className="max-w-sm text-sm text-slate-400 dark:text-slate-500">
            ייתכן שהשאלון נשלח אבל לא הוגדרו עבורו סעיפים, או שהתשובה נשמרה ריקה.
          </p>
        </div>
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

/* Keep `FullScreenIcon` import & helpers tree-shaken */
export type { FormResponseViewerProps };
