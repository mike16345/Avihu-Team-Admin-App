import { QueryKeys } from "@/enums/QueryKeys";
import useAgreementsAdminApi, { SignedAgreementsParams } from "@/hooks/api/useAgreementsAdminApi";
import { useUsersStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useAgreementsQuery = (adminId: string | undefined, queryParams: SignedAgreementsParams) => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId);
  const { getSignedAgreements } = useAgreementsAdminApi();

  return useQuery({
    queryKey: [QueryKeys.AGREEMENTS_SIGNED, trainerId, queryParams],
    queryFn: () => getSignedAgreements(queryParams),
    enabled: Boolean(adminId) && Boolean(trainerId),
  });
};

export default useAgreementsQuery;
