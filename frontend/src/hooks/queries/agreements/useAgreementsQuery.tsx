import { QueryKeys } from "@/enums/QueryKeys";
import useAgreementsAdminApi, { SignedAgreementsParams } from "@/hooks/api/useAgreementsAdminApi";
import { useQuery } from "@tanstack/react-query";

const useAgreementsQuery = (adminId: string | undefined, queryParams: SignedAgreementsParams) => {
  const { getSignedAgreements } = useAgreementsAdminApi();

  return useQuery({
    queryKey: [QueryKeys.AGREEMENTS_SIGNED, queryParams],
    queryFn: () => getSignedAgreements(queryParams),
    enabled: Boolean(adminId),
  });
};

export default useAgreementsQuery;
