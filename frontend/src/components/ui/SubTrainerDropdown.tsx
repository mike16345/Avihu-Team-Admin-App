import React, { useMemo } from "react";
import ComboBox, { ComboBoxProps } from "./combo-box";
import { convertItemsToOptions } from "@/lib/utils";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";

type SubTrainerDropdownProps = Omit<ComboBoxProps, "options">;

const SubTrainerDropdown: React.FC<SubTrainerDropdownProps> = (props) => {
  const { data, isLoading } = useSubTrainersQuery();

  const options = useMemo(() => {
    if (!data || !data.length) return [];

    return convertItemsToOptions(data ?? [], "fullName", "_id");
  }, [data]);

  return <ComboBox options={options} {...props} isLoading={isLoading} />;
};

export default SubTrainerDropdown;
