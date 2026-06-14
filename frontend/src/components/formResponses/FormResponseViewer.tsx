import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormResponseAnswer } from "./FormResponseAnswer";
import type { FullscreenState, FormResponseViewerProps } from "./formResponseViewerTypes";
import {
  accentOf,
  extractAllPhotoKeys,
  formatSubmittedAt,
  getFormTypeLabel,
  getSectionLabel,
  initialsOf,
} from "./formResponseViewerUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FullscreenImage } from "@/components/UserDashboard/WeightProgression/FullscreenImage";
import CustomSelect from "../ui/CustomSelect";
import { convertItemsToOptions } from "@/lib/utils";
import { sendData } from "@/API/api";
import { ApiResponse } from "@/types/types";
import { FaClipboardList, FaCalendarDay, FaImages, FaCheck } from "react-icons/fa6";
const getPhotoImportButtonStateClassName = (imported: boolean, importing: boolean) => {
  if (imported) return "cursor-default bg-emerald-600";
  if (importing) return "cursor-not-allowed bg-blue-400";
  return "bg-blue-600 hover:bg-blue-700";
};
const getPhotoImportButtonContent = (imported: boolean, importing: boolean) => {
  if (imported) {
    return (
      <>
        <FaCheck size={11} />
        {"\u05e0\u05d5\u05e1\u05e4\u05d5 \u05dc\u05d2\u05dc\u05e8\u05d9\u05d4"}
      </>
    );
  }
  if (importing) return "\u05de\u05d5\u05e1\u05d9\u05e3...";
  return (
    <>
      <FaImages size={12} />
      {
        "\u05d4\u05d5\u05e1\u05e3 \u05dc\u05d2\u05dc\u05e8\u05d9\u05d9\u05ea \u05d4\u05ea\u05de\u05d5\u05e0\u05d5\u05ea"
      }
    </>
  );
};
const FormResponseViewer = ({
  response,
  respondentName,
  navigationMode = "auto",
}: FormResponseViewerProps) => {
  const sections = useMemo(() => response.sections ?? [], [response.sections]);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?._id ?? "");
  const [fullscreenState, setFullscreenState] = useState<FullscreenState | null>(null);
  const [importingPhotos, setImportingPhotos] = useState(false);
  const [importedThisSession, setImportedThisSession] = useState(false);
  const photoKeys = useMemo(() => extractAllPhotoKeys(response), [response]);
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
  const typeLabel = getFormTypeLabel(rawFormType);
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
  const totalQuestions = useMemo(
    () => sections.reduce((acc, s) => acc + (s.questions?.length ?? 0), 0),
    [sections]
  );
  useEffect(() => {
    setActiveSectionId(sections[0]?._id ?? "");
    setFullscreenState(null);
  }, [response._id, sections]);
  return (
    <div dir="rtl" className="flex flex-col gap-6 p-2 font-heebo">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="brand-gradient flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm">
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
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${getPhotoImportButtonStateClassName(
                importedThisSession,
                importingPhotos
              )}`}
            >
              {getPhotoImportButtonContent(importedThisSession, importingPhotos)}
            </button>
          </div>
        )}
      </div>
      {sections.length ? (
        <>
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
                      <FormResponseAnswer
                        question={question}
                        onImageSelect={(images, selectedIndex) =>
                          setFullscreenState({ images, index: selectedIndex })
                        }
                      />
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
export type { FormResponseViewerProps };
