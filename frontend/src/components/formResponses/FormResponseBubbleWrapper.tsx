import useGetOneFormResponseQuery from "@/hooks/queries/formResponses/useGetOneFormResponseQuery";
import { FormResponse } from "@/interfaces/IFormResponse";
import { FC } from "react";
import FormResponseBubble from "./FormResponseBubble";
import { useGetUsersLatestResponse } from "@/hooks/queries/formResponses/useGetUsersLatestResponse";

interface FormResponseBubbleWrapperProps {
  userId: string | undefined;
}

const FormResponseBubbleWrapper: FC<FormResponseBubbleWrapperProps> = ({ userId }) => {
  const { data } = useGetUsersLatestResponse(userId);
  const responseId = data?.data?._id;

  return <FormResponseBubble responseId={responseId} formResponse={data?.data} />;
};

export default FormResponseBubbleWrapper;
