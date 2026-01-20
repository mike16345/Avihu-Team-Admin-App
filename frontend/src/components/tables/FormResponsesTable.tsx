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

type FormResponsesTableProps = {
  userId?: string;
};

const FormResponsesTable = ({ userId }: FormResponsesTableProps) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFormResponsesQuery(
    userId ? { userId } : undefined
  );

  const columns = useFormResponseColumns();

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

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <DataTableHebrew
      data={filteredData}
      columns={columns}
      isLoadingNextPage={isLoading}
      handleSetData={() => {}}
      handleViewData={handleViewResponse}
      handleDeleteData={() => {}}
      handleViewNestedData={() => {}}
      getRowClassName={() => "cursor-pointer"}
      handleHoverOnRow={() => false}
      getRowId={(row) => row._id || ""}
      rowClickMode="single"
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
