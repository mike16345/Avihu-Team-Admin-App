import useAgreementsAdminApi, {
  AgreementTemplateActivateBody,
} from "@/hooks/api/useAgreementsAdminApi";
import { useMutation } from "@tanstack/react-query";

const useActivateAgreement = () => {
  const { activateTemplate } = useAgreementsAdminApi();

  const handleActivateAgreement = async (params: AgreementTemplateActivateBody) => {
    return activateTemplate(params);
  };

  return useMutation({ mutationFn: handleActivateAgreement });
};

export default useActivateAgreement;
