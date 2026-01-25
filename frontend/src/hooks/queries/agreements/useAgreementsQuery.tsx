import { QueryKeys } from "@/enums/QueryKeys";
import useAgreementsAdminApi, { SignedAgreementsParams } from "@/hooks/api/useAgreementsAdminApi";
import { useQuery } from "@tanstack/react-query";

const useAgreementsQuery = (adminId: string | undefined, queryParams: SignedAgreementsParams) => {
  const { getSignedAgreements } = useAgreementsAdminApi();
  const stringified = JSON.stringify(queryParams);

  return useQuery({
    queryKey: [QueryKeys.AGREEMENTS_SIGNED, stringified],
    queryFn: () => getSignedAgreements(queryParams),
    enabled: Boolean(adminId),
  });
};

export default useAgreementsQuery;
