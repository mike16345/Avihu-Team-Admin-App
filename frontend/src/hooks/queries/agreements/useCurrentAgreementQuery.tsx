import { ONE_MIN_IN_MILLISECONDS } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useAgreementsApi from "@/hooks/api/useAgreementsApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useCurrentAgreementQuery = () => {
  const { getCurrentAgreement } = useAgreementsApi();

  return useQuery({
    queryKey: [QueryKeys.AGREEMENT_CURRENT],
    queryFn: () => getCurrentAgreement(),
    retry: createRetryFunction(404, 2),
    staleTime: ONE_MIN_IN_MILLISECONDS * 30,
  });
};

export default useCurrentAgreementQuery;
