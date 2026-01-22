import { useMemo } from "react";
import { useParams } from "react-router-dom";
import useFormResponseQuery from "@/hooks/queries/formResponses/useFormResponseQuery";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import FormResponseViewer from "@/components/formResponses/FormResponseViewer";
import { useUsersStore } from "@/store/userStore";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import BackButton from "@/components/ui/BackButton";

const FormResponseDetailsPage = () => {
  const { id } = useParams();
  const { data, isLoading, isError, error } = useFormResponseQuery(id);
  const response = data?.data;
  const { users } = useUsersStore();
  const cachedUser = users.find((entry) => entry._id === response?.userId);
  const { data: fetchedUser } = useUserQuery(
    response?.userId,
    Boolean(response?.userId) && !cachedUser
  );

  const respondentName = useMemo(() => {
    const user = cachedUser || fetchedUser;
    const firstName = user?.firstName?.trim() ?? "";
    const lastName = user?.lastName?.trim() ?? "";
    const name = `${firstName} ${lastName}`.trim();
    return name || response?.userId || "Unknown user";
  }, [cachedUser, fetchedUser, response?.userId]);

  if (isLoading) return <Loader size="large" />;
  if (isError && !response) return <ErrorPage message={error?.message} />;

  return (
    <div className="size-full flex flex-col gap-4">
      <BackButton fixedPosition navLink="/form-builder" />
      {response ? (
        <FormResponseViewer response={response} respondentName={respondentName} />
      ) : (
        <div className="py-10 text-center text-sm text-muted-foreground">No response found.</div>
      )}
    </div>
  );
};

export default FormResponseDetailsPage;
