import { useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa6";
import { IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { generateUUID } from "@/lib/utils";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";

import DeleteModal from "../Alerts/DeleteModal";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import TextEditor from "../ui/TextEditor";
import WorkoutTabs from "./WorkoutTabs";
import WorkoutPlanContainer from "./WorkoutPlanContainer";
import CardioWrapper from "./cardio/CardioWrapper";
import {
  cloneMuscleGroupForCopy,
  CopyMuscleGroupRequest,
  findMuscleGroupIndex,
  getWorkoutDisplayName,
} from "./workoutPlanCopyUtils";

const getWorkoutTipsValue = (tips: string[] | undefined) => tips?.join(" ") || "";

const WorkoutPlans = () => {
  const form = useFormContext<WorkoutSchemaType>();
  const { control, setValue, watch } = form;
  const {
    append: addWorkoutPlan,
    move: moveWorkoutPlan,
    remove: removeWorkoutPlan,
    update: updateWorkoutPlan,
  } = useFieldArray({
    control,
    name: "workoutPlans",
  });

  const workoutPlans = (watch("workoutPlans") as IWorkoutPlan[]) ?? [];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const workoutIndex = useRef<number | null>(null);

  const onAddWorkout = () => {
    const newWorkoutPlan: IWorkoutPlan = {
      planName: `אימון ${workoutPlans.length + 1}`,
      muscleGroups: [],
      _id: generateUUID(),
    };

    addWorkoutPlan(newWorkoutPlan);
  };

  const onClickDeleteWorkout = (index: number) => {
    workoutIndex.current = index;
    setIsDeleteModalOpen(true);
  };

  const onConfirmDeleteWorkout = () => {
    if (workoutIndex.current === null) return;

    removeWorkoutPlan(workoutIndex.current);
    workoutIndex.current = null;
    toast.success("אימון נמחק בהצלחה!");
  };

  const handleCopyMuscleGroup = ({
    sourceWorkoutIndex,
    sourceMuscleGroupIndex,
    targetWorkoutIndex,
  }: CopyMuscleGroupRequest) => {
    const currentWorkoutPlans = form.getValues("workoutPlans") as IWorkoutPlan[];
    const sourceWorkout = currentWorkoutPlans?.[sourceWorkoutIndex];
    const targetWorkout = currentWorkoutPlans?.[targetWorkoutIndex];
    const sourceMuscleGroup = sourceWorkout?.muscleGroups?.[sourceMuscleGroupIndex];

    if (!sourceWorkout || !targetWorkout || !sourceMuscleGroup) {
      toast.error("לא הצלחנו להעתיק את קבוצת השריר. נסה שוב.");
      return;
    }

    const copiedMuscleGroup = cloneMuscleGroupForCopy(sourceMuscleGroup);
    const targetGroupIndex = findMuscleGroupIndex(targetWorkout, sourceMuscleGroup.muscleGroup);
    const nextMuscleGroups =
      targetGroupIndex === -1
        ? [...targetWorkout.muscleGroups, copiedMuscleGroup]
        : targetWorkout.muscleGroups.map((group, index) =>
            index === targetGroupIndex ? copiedMuscleGroup : group
          );

    updateWorkoutPlan(targetWorkoutIndex, {
      ...targetWorkout,
      muscleGroups: nextMuscleGroups,
    });

    const targetWorkoutName = getWorkoutDisplayName(targetWorkout, targetWorkoutIndex);
    const actionText = targetGroupIndex === -1 ? "הועתקה" : "הוחלפה";

    toast.success(
      `קבוצת השריר ${sourceMuscleGroup.muscleGroup} ${actionText} ב-${targetWorkoutName}.`
    );
  };

  const renderWorkoutTipsEditor = () => (
    <TextEditor
      value={getWorkoutTipsValue(watch("tips"))}
      onChange={(value) => setValue("tips", [value], { shouldDirty: true })}
    />
  );

  const renderWorkoutPlanTab = () => (
    <div className="flex flex-col gap-3">
      <DragDropWrapper
        items={workoutPlans}
        strategy="vertical"
        idKey="_id"
        onMove={moveWorkoutPlan}
      >
        {({ item, index }) => (
          <SortableItem className="relative w-full overflow-visible" idKey="_id" item={item}>
            {() => (
              <WorkoutPlanContainer
                onDeleteWorkout={(currentIndex) => onClickDeleteWorkout(currentIndex)}
                parentPath={`workoutPlans.${index}`}
                workoutPlans={workoutPlans}
                onCopyMuscleGroup={handleCopyMuscleGroup}
              />
            )}
          </SortableItem>
        )}
      </DragDropWrapper>

      <button
        type="button"
        onClick={onAddWorkout}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/40 px-4 py-3.5 text-sm font-semibold text-slate-500 transition-all hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
      >
        <FaPlus size={12} />
        <span>הוסף אימון</span>
      </button>
    </div>
  );

  return (
    <>
      <div dir="rtl" className="flex w-full flex-col gap-4 font-heebo">
        <WorkoutTabs
          tips={renderWorkoutTipsEditor()}
          cardioPlan={<CardioWrapper />}
          workoutPlan={renderWorkoutPlanTab()}
        />
      </div>

      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={onConfirmDeleteWorkout}
      />
    </>
  );
};

export default WorkoutPlans;
