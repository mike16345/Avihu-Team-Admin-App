import useAgreementsAdminApi from "@/hooks/api/useAgreementsAdminApi";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadParameters {
  agreementId: string;
  adminId: string;
  file: File;
}

const useUploadAgreement = () => {
  const { createTemplateUploadUrl } = useAgreementsAdminApi();

  const handleUpload = async (params: UploadParameters) => {
    const { agreementId, adminId, file } = params;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("ניתן להעלות קובץ PDF בלבד.");
      throw new Error("ניתן להעלות קובץ PDF בלבד.");
    }
    const uploadResponse = await createTemplateUploadUrl({
      agreementId: agreementId,
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

    toast.success(`הקובץ הועלה בהצלחה (גרסה ${version}).`);
    return { version };
  };

  return useMutation({
    mutationFn: handleUpload,
  });
};

export default useUploadAgreement;
