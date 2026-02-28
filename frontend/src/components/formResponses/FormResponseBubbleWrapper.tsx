import useGetOneFormResponseQuery from "@/hooks/queries/formResponses/useGetOneFormResponseQuery";
import { FormResponse } from "@/interfaces/IFormResponse";
import { FC } from "react";
import FormResponseBubble from "./FormResponseBubble";

interface FormResponseBubbleWrapperProps {
  userId: string | undefined;
  query: Partial<FormResponse>;
}

const FormResponseBubbleWrapper: FC<FormResponseBubbleWrapperProps> = ({ userId, query }) => {
  const { data } = useGetOneFormResponseQuery({ userId, ...query });
  const responseId = data?.data?._id;

  return <FormResponseBubble responseId={responseId} formResponse={data?.data} />;
};

export default FormResponseBubbleWrapper;
