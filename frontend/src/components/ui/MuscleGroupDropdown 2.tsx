import React from "react";
import ComboBox, { ComboBoxProps } from "./combo-box";
import { convertStringsToOptions } from "@/lib/utils";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";

type MuscleGroupDropdownProps = Omit<ComboBoxProps, "options">;

const MuscleGroupDropdown: React.FC<MuscleGroupDropdownProps> = (props) => {
  const options = convertStringsToOptions(MUSCLE_GROUPS);

  return <ComboBox options={options} {...props} />;
};

export default MuscleGroupDropdown;
