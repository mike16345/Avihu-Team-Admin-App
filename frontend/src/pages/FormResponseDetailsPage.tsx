import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useFormResponseQuery from "@/hooks/queries/formResponses/useFormResponseQuery";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import FormResponseViewer from "@/components/formResponses/FormResponseViewer";
import { useUsersStore } from "@/store/userStore";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import { FaArrowRight } from "react-icons/fa6";
import { getFullUserName, isUserIdObject } from "@/components/agreements/SignedAgreementsTable";

const FormResponseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users } = useUsersStore();
  const handleBack = () => {
    const canGoBack =
      typeof window !== "undefined" &&
      typeof window.history.state?.idx === "number" &&
      window.history.state.idx > 0;
    if (canGoBack) navigate(-1);
    else navigate("/form-builder");
  };

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
    <div dir="rtl" className="size-full flex flex-col gap-4 font-heebo">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-blue-600"
      >
        <FaArrowRight size={11} />
        <span>חזרה</span>
      </button>

      {response ? (
        <FormResponseViewer response={response} respondentName={respondentName} />
      ) : (
        <div className="py-10 text-center text-sm text-muted-foreground">לא מצאנו תשובה</div>
      )}
    </div>
  );
};

export default FormResponseDetailsPage;
