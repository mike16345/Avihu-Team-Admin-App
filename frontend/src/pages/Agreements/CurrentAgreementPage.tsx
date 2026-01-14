import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import AgreementQuestionsEditor from "@/components/agreements/AgreementQuestionsEditor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { QueryKeys } from "@/enums/QueryKeys";
import useAgreementsAdminApi from "@/hooks/api/useAgreementsAdminApi";
import useAgreementsApi from "@/hooks/api/useAgreementsApi";
import { AgreementQuestionDefinition } from "@/interfaces/IAgreement";
import ErrorPage from "@/pages/ErrorPage";
import { useUsersStore } from "@/store/userStore";
import BackButton from "@/components/ui/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRetryFunction } from "@/lib/utils";

const CurrentAgreementPage = () => {
  const currentUser = useUsersStore((state) => state.currentUser);
  const adminId = import.meta.env.VITE_DEFAULT_TRAINER_ID ?? currentUser?._id;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { getCurrentAgreement } = useAgreementsApi();
  const { createTemplateUploadUrl, activateTemplate } = useAgreementsAdminApi();

  const [pendingVersion, setPendingVersion] = useState<number | null>(null);
  const [questions, setQuestions] = useState<AgreementQuestionDefinition[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.AGREEMENT_CURRENT],
    queryFn: () => getCurrentAgreement(),
    retry: createRetryFunction(404, 2),
  });

  const currentAgreement = data?.data;

  useEffect(() => {
    if (!currentAgreement) return;
    if (pendingVersion) return;

    setQuestions(currentAgreement.questions ?? []);
  }, [currentAgreement, pendingVersion]);

  const uploadNotice = useMemo(() => {
    if (!pendingVersion) return null;

    return `גרסה חדשה (v${pendingVersion}) הועלתה. ערוך את השאלות והפעל את הגרסה.`;
  }, [pendingVersion]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("ניתן להעלות קובץ PDF בלבד.");
      return;
    }

    try {
      setIsUploading(true);
      const uploadResponse = await createTemplateUploadUrl({
        agreementId: currentAgreement?.agreementId,
        contentType: "application/pdf",
        adminId,
      });

      const { uploadUrl, version } = uploadResponse.data;
      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error("העלאת הקובץ נכשלה.");
      }

      setPendingVersion(version);
      setQuestions(currentAgreement?.questions ?? []);
      toast.success(`הקובץ הועלה בהצלחה (גרסה ${version}).`);
    } catch (uploadError: any) {
      toast.error("העלאת ההסכם נכשלה", {
        description: uploadError?.message || uploadError?.data?.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleActivate = async () => {
    if (!currentAgreement) return;

    const version = pendingVersion ?? currentAgreement.version;

    try {
      setIsSaving(true);
      await activateTemplate({
        agreementId: currentAgreement.agreementId,
        version,
        questions,
        adminId,
      });
      toast.success("הגרסה הופעלה בהצלחה.");
      setPendingVersion(null);
      await refetch();
    } catch (saveError: any) {
      toast.error("שמירת ההסכם נכשלה", {
        description: saveError?.data?.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  console.log("Error", error);
  if (isLoading) return <Loader size="xl" />;
  if (isError && error.status !== 404) return <ErrorPage message={error.message} />;
  if (!currentAgreement) {
    return (
      <div className="space-y-6" dir="rtl">
        <BackButton fixedPosition navLink="/form-builder" />

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
              <Button onClick={handleUploadClick} disabled={isUploading}>
                {isUploading ? "מעלה..." : "העלאת הסכם חדש"}
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
      </div>
    );
  }
  return (
    <div className="space-y-6" dir="rtl">
      <BackButton fixedPosition navLink="/form-builder" />
      <Card>
        <CardHeader>
          <CardTitle>הסכם נוכחי</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-muted-foreground">גרסה פעילה</div>
              <div className="font-medium">v{currentAgreement.version}</div>
            </div>
            <Button onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? "מעלה..." : "העלאת PDF חדש"}
            </Button>
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
          <div className="rounded-lg border overflow-hidden min-h-[600px]">
            <iframe
              title="Agreement PDF"
              src={currentAgreement.pdfUrl}
              className="w-full h-[600px]"
            />
          </div>
        </CardContent>
      </Card>
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
