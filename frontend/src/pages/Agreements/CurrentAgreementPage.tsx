import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AgreementQuestionsEditor from "@/components/agreements/AgreementQuestionsEditor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { pdfjs, Document, Page } from "react-pdf";
import { AgreementTemplateActivateBody } from "@/hooks/api/useAgreementsAdminApi";
import { AgreementQuestionDefinition } from "@/interfaces/IAgreement";
import ErrorPage from "@/pages/ErrorPage";
import { useUsersStore } from "@/store/userStore";
import BackButton from "@/components/ui/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCurrentAgreementQuery from "@/hooks/queries/agreements/useCurrentAgreementQuery";
import useUploadAgreement from "@/hooks/mutations/agreements/useUploadAgreement";
import { Download } from "lucide-react";
import { CustomTooltip } from "@/components/ui/custom-tooltip";
import useActivateAgreement from "@/hooks/mutations/agreements/useActivateAgreement";

pdfjs.GlobalWorkerOptions.workerSrc = "/workers/pdf.worker.mjs";

const CurrentAgreementPage = () => {
  const adminId =
    import.meta.env.VITE_DEFAULT_TRAINER_ID ?? useUsersStore((state) => state.currentUser)?._id;

  const { data: currentAgreement, isLoading, isError, error, refetch } = useCurrentAgreementQuery();
  const { isPending, mutateAsync: uploadAgreement } = useUploadAgreement();
  const { isPending: isSaving, mutateAsync: activateTemplate } = useActivateAgreement();

  const [pendingVersion, setPendingVersion] = useState<number | null>(null);
  const [questions, setQuestions] = useState<AgreementQuestionDefinition[]>([]);
  const [numPages, setNumPages] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const result = await uploadAgreement({
        file,
        agreementId: currentAgreement?.data.agreementId ?? "",
        adminId: adminId,
      });

      setQuestions(currentAgreement?.data.questions ?? []);
      if (result?.version) {
        setPendingVersion(result.version);
      }
    } catch (uploadError: any) {
      toast.error("העלאת ההסכם נכשלה", {
        description: uploadError?.message || uploadError?.data?.message,
      });
    }
  };

  const handleActivate = async () => {
    if (!currentAgreement) return;

    const version = pendingVersion ?? currentAgreement.data.version;

    try {
      const params: AgreementTemplateActivateBody = {
        agreementId: currentAgreement.data.agreementId,
        version,
        questions,
        adminId,
      };

      await activateTemplate(params);
      toast.success("הגרסה הופעלה בהצלחה.");
      setPendingVersion(null);
      await refetch();
    } catch (saveError: any) {
      toast.error("שמירת ההסכם נכשלה", {
        description: saveError?.data?.message,
      });
    }
  };

  const uploadNotice = useMemo(() => {
    if (!pendingVersion) return null;

    return `גרסה חדשה (v${pendingVersion}) הועלתה. ערוך את השאלות והפעל את הגרסה.`;
  }, [pendingVersion]);

  useEffect(() => {
    if (!currentAgreement) return;
    if (pendingVersion) return;

    setQuestions(currentAgreement.data.questions ?? []);
  }, [currentAgreement, pendingVersion]);

  if (isLoading) return <Loader size="xl" />;
  if (isError && error.status !== 404) return <ErrorPage message={error.message} />;

  return (
    <div className="space-y-6" dir="rtl">
      <BackButton fixedPosition navLink="/form-builder" />
      {!currentAgreement && (
        <Card>
          <CardHeader>
            <CardTitle>לא קיים הסכם פעיל</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>אין הסכם במערכת</AlertTitle>
              <AlertDescription>
                טרם הועלה הסכם. יש להעלות קובץ PDF כדי ליצור גרסה ראשונה.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end">
              <Button onClick={handleUploadClick} disabled={isPending}>
                {isPending ? "מעלה..." : "העלאת הסכם חדש"}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>
      )}

      {!!currentAgreement && (
        <Card>
          <CardHeader>
            <CardTitle>הסכם נוכחי</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-muted-foreground">גרסה פעילה</div>
                <div className="font-medium">v{currentAgreement.data.version}</div>
              </div>
              <Button onClick={handleUploadClick} disabled={isPending}>
                {isPending ? "מעלה..." : "העלאת PDF חדש"}
              </Button>
              <CustomTooltip
                tooltipContent="הורד"
                tooltipTrigger={
                  <Button variant={"outline"} asChild>
                    <a href={currentAgreement.data.pdfUrl} target="_blank" rel="noreferrer">
                      <Download />
                    </a>
                  </Button>
                }
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {uploadNotice && (
              <Alert>
                <AlertTitle>גרסה חדשה מוכנה להפעלה</AlertTitle>
                <AlertDescription>{uploadNotice}</AlertDescription>
              </Alert>
            )}
            <div className="rounded-lg border overflow-hidden h-[600px] bg-muted/20">
              <div className="h-full overflow-auto flex justify-center p-4">
                <Document
                  file={currentAgreement.data.pdfUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <div className="w-full flex justify-center py-10">
                      <Loader />
                    </div>
                  }
                  error={<div className="text-sm text-destructive">שגיאה בטעינת ה-PDF</div>}
                >
                  {Array.from({ length: numPages }, (_, i) => (
                    <Page
                      key={`page_${i + 1}`}
                      pageNumber={i + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="shadow-sm"
                    />
                  ))}
                </Document>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>שאלות בריאות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AgreementQuestionsEditor questions={questions} onChange={setQuestions} />
          <div className="flex justify-end">
            <Button onClick={handleActivate} disabled={isSaving}>
              {isSaving ? "שומר..." : pendingVersion ? "הפעל גרסה חדשה" : "שמור שאלות"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrentAgreementPage;
