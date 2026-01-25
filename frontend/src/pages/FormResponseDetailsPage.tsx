import { useMemo } from "react";
import { useParams } from "react-router-dom";
import useFormResponseQuery from "@/hooks/queries/formResponses/useFormResponseQuery";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import FormResponseViewer from "@/components/formResponses/FormResponseViewer";
import { useUsersStore } from "@/store/userStore";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import BackButton from "@/components/ui/BackButton";
import { getFullUserName, isUserIdObject } from "@/components/agreements/SignedAgreementsTable";

const FormResponseDetailsPage = () => {
  const { id } = useParams();
  const { users } = useUsersStore();

  const { data, isLoading, isError, error } = useFormResponseQuery(id);
  const response = data?.data;

  const userId = useMemo(() => {
    return isUserIdObject(response?.userId) ? response?.userId._id : response?.userId;
  }, [response?.userId]);

  const cachedUser = users.find((entry) => entry._id === userId);

  const { data: fetchedUser } = useUserQuery(userId, Boolean(response?.userId) && !cachedUser);

  const respondentName = useMemo(() => {
    const user = cachedUser || fetchedUser;
    const name = getFullUserName(user);

    return name || userId || "לא ידוע";
  }, [cachedUser, fetchedUser, userId]);

  if (isLoading) return <Loader size="large" />;
  if (isError && !response) return <ErrorPage message={error?.message} />;

  return (
    <div className="size-full flex flex-col gap-4">
      <BackButton fixedPosition navLink="/form-builder" />
      {response ? (
        <FormResponseViewer response={response} respondentName={respondentName} />
      ) : (
        <div className="py-10 text-center text-sm text-muted-foreground">לא מצאנו תשובה</div>
      )}
    </div>
  );
};

export default FormResponseDetailsPage;
