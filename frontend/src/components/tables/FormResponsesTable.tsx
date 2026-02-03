import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { useFormResponseColumns } from "@/components/tables/Columns/forms/FormResponseColumns";
import useFormResponsesQuery from "@/hooks/queries/formResponses/useFormResponsesQuery";
import { FormResponse } from "@/interfaces/IFormResponse";
import ErrorPage from "@/pages/ErrorPage";
import FilterMultiSelect from "./FilterMultiSelect";
import { FormTypes } from "@/interfaces/IForm";
import { FormTypeOptions } from "@/constants/form";
import { useMutation } from "@tanstack/react-query";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import queryClient from "@/QueryClient/queryClient";
import { formResponsesKeys } from "@/hooks/queries/formResponses/formResponsesKeys";
import { resolveUserName } from "@/components/agreements/SignedAgreementsTable";

type FormResponsesTableProps = {
  userId?: string;
  paginationKey?: string;
};

const FormResponsesTable = ({ userId, paginationKey }: FormResponsesTableProps) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFormResponsesQuery(
    userId ? { userId } : undefined
  );

  const columns = useFormResponseColumns();
  const { deleteFormById } = useFormResponsesApi();

  const deleteResponseMutation = useMutation({
    mutationFn: (id: string) => deleteFormById(id),
    onSuccess: () => {
      toast.success("התגובה נמחקה בהצלחה!");
      queryClient.invalidateQueries({ queryKey: formResponsesKeys.all });
    },
    onError: () => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
    },
  });

  const handleViewResponse = (response: FormResponse) => {
    if (!response?._id) return;
    navigate(`/form-responses/${response._id}`);
  };

  const [selectedGroups, setSelectedGroups] = useState<FormTypes[]>([]);

  const filteredData = useMemo(() => {
    if (selectedGroups.length === 0) return data?.data || [];
    return (data?.data || []).filter((response) =>
      selectedGroups.includes(response.formType as FormTypes)
    );
  }, [data, selectedGroups]);

  const searchFn = (response: FormResponse, query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    const userName = resolveUserName(response.userId) ?? "";
    const formName = response.formTitle ?? response.formId?.name ?? "";

    return [userName, formName].some((value) => value.toLowerCase().includes(normalizedQuery));
  };

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <DataTableHebrew
      data={filteredData}
      columns={columns}
      paginationKey={paginationKey}
      isLoadingNextPage={isLoading}
      handleSetData={() => {}}
      handleViewData={handleViewResponse}
      searchFn={searchFn}
      searchPlaceholder="חיפוש לפי משתמש או שאלון"
      handleDeleteData={(response) => {
        if (response._id) deleteResponseMutation.mutate(response._id);
      }}
      handleViewNestedData={() => {}}
      getRowClassName={() => "cursor-pointer"}
      handleHoverOnRow={() => false}
      getRowId={(row) => row._id || ""}
      filters={
        FormTypeOptions.length ? (
          <FilterMultiSelect
            className="w-72"
            label="סוג השאלון"
            options={FormTypeOptions}
            selected={selectedGroups}
            onChange={(values) => setSelectedGroups(values as FormTypes[])}
            placeholder="כל הקבוצות"
          />
        ) : null
      }
    />
  );
};

export default FormResponsesTable;
