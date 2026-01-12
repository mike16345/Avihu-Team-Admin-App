import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { useFormResponseColumns } from "@/components/tables/Columns/forms/FormResponseColumns";
import useFormResponsesQuery from "@/hooks/queries/formResponses/useFormResponsesQuery";
import useUsersQuery from "@/hooks/queries/user/useUsersQuery";
import { useUsersStore } from "@/store/userStore";
import { FormResponse } from "@/interfaces/IFormResponse";
import ErrorPage from "@/pages/ErrorPage";
import FilterMultiSelect from "./FilterMultiSelect";
import { FormTypes } from "@/interfaces/IForm";
import { Option } from "@/types/types";
import { FormTypeOptions } from "@/constants/form";

type FormResponsesTableProps = {
  userId?: string;
};

const FormResponsesTable = ({ userId }: FormResponsesTableProps) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useFormResponsesQuery(
    userId ? { userId } : undefined
  );

  useUsersQuery();
  const { users } = useUsersStore();

  const resolveUserName = useCallback(
    (id: string) => {
      if (!id) return "Unknown user";
      const user = users.find((entry) => entry._id === id);
      if (!user) return id;
      const firstName = user.firstName?.trim() ?? "";
      const lastName = user.lastName?.trim() ?? "";
      const name = `${firstName} ${lastName}`.trim();
      return name || id;
    },
    [users]
  );

  const columns = useFormResponseColumns({ resolveUserName });

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
