import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { FaPlus } from "react-icons/fa6";
import {
  IWorkoutBlock,
  IWorkoutPlan,
  WorkoutBlockStatus,
  WorkoutPlanMode,
} from "@/interfaces/IWorkoutPlan";
import { generateUUID } from "@/lib/utils";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";

import DeleteModal from "../Alerts/DeleteModal";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import TextEditor from "../ui/TextEditor";
import WorkoutTabs from "./WorkoutTabs";
import WorkoutPlanContainer from "./WorkoutPlanContainer";
import WorkoutModeToggle from "./WorkoutModeToggle";
import WorkoutBlocksBar from "./WorkoutBlocksBar";
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
  const { control, setValue, watch, getValues } = form;
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

  const mode = (watch("mode") as WorkoutPlanMode | undefined) || "unified";
  const blocks = (watch("blocks") as IWorkoutBlock[] | undefined) ?? [];
  const activeBlockIndex = (watch("activeBlockIndex") as number | undefined) ?? 0;
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(activeBlockIndex);

  const persistCurrentBlock = () => {
    const currentPlans = (getValues("workoutPlans") as IWorkoutPlan[]) || [];
    const currentTips = (getValues("tips") as string[] | undefined) || [];
    const currentBlocks = (getValues("blocks") as IWorkoutBlock[]) || [];
    if (!currentBlocks[currentBlockIndex]) return;
    const nextBlocks = currentBlocks.map((b, i) =>
      i === currentBlockIndex ? { ...b, workoutPlans: currentPlans, tips: currentTips } : b
    );
    setValue("blocks", nextBlocks, { shouldDirty: true });
  };

  const watchedWorkoutPlans = watch("workoutPlans");
  const watchedTips = watch("tips");
  useEffect(() => {
    if (mode !== "blocks") return;
    const currentBlocks = (getValues("blocks") as IWorkoutBlock[]) || [];
    if (!currentBlocks[currentBlockIndex]) return;
    const existing = currentBlocks[currentBlockIndex];
    const nextPlans = (watchedWorkoutPlans as IWorkoutPlan[]) || [];
    const nextTips = (watchedTips as string[] | undefined) || [];
    if (existing.workoutPlans === nextPlans && existing.tips === nextTips) return;
    const nextBlocks = currentBlocks.map((b, i) =>
      i === currentBlockIndex ? { ...b, workoutPlans: nextPlans, tips: nextTips } : b
    );
    setValue("blocks", nextBlocks, { shouldDirty: true });
  }, [watchedWorkoutPlans, watchedTips, mode, currentBlockIndex]);

  const handleModeChange = (nextMode: WorkoutPlanMode) => {
    if (nextMode === mode) return;
    if (nextMode === "blocks") {
      const existing = (getValues("blocks") as IWorkoutBlock[]) || [];
      const seededBlocks =
        existing.length > 0
          ? existing
          : [
              {
                id: generateUUID(),
                workoutPlans: (getValues("workoutPlans") as IWorkoutPlan[]) || [],
                tips: (getValues("tips") as string[] | undefined) || [],
              },
            ];
      setValue("blocks", seededBlocks, { shouldDirty: true });
      setValue("activeBlockIndex", activeBlockIndex ?? 0, { shouldDirty: true });
      setCurrentBlockIndex(activeBlockIndex ?? 0);
    } else {
      persistCurrentBlock();
      const active = (getValues("blocks") as IWorkoutBlock[])?.[activeBlockIndex ?? 0];
      if (active?.workoutPlans?.length) {
        setValue("workoutPlans", active.workoutPlans, { shouldDirty: true });
      }
      if (active?.tips) {
        setValue("tips", active.tips, { shouldDirty: true });
      }
    }
    setValue("mode", nextMode, { shouldDirty: true });
  };

  const handleSelectBlock = (index: number) => {
    if (index === currentBlockIndex) return;
    persistCurrentBlock();
    const nextBlock = ((getValues("blocks") as IWorkoutBlock[]) || [])[index];
    setValue("workoutPlans", nextBlock?.workoutPlans || [], { shouldDirty: true });
    setValue("tips", nextBlock?.tips || [], { shouldDirty: true });
    setCurrentBlockIndex(index);
  };

  const handleAddBlock = () => {
    persistCurrentBlock();
    const currentBlocks = (getValues("blocks") as IWorkoutBlock[]) || [];
    const newBlock: IWorkoutBlock = { id: generateUUID(), workoutPlans: [], tips: [] };
    const nextBlocks = [...currentBlocks, newBlock];
    setValue("blocks", nextBlocks, { shouldDirty: true });
    setValue("workoutPlans", [], { shouldDirty: true });
    setValue("tips", [], { shouldDirty: true });
    setCurrentBlockIndex(nextBlocks.length - 1);
  };

  const handleDeleteBlock = (index: number) => {
    const currentBlocks = (getValues("blocks") as IWorkoutBlock[]) || [];
    if (currentBlocks.length <= 1) return;
    const nextBlocks = currentBlocks.filter((_, i) => i !== index);
    const nextCurrentIdx = Math.max(0, currentBlockIndex - (index <= currentBlockIndex ? 1 : 0));
    const nextActiveIdx = Math.max(
      0,
      (activeBlockIndex ?? 0) - (index <= (activeBlockIndex ?? 0) ? 1 : 0)
    );
    setValue("blocks", nextBlocks, { shouldDirty: true });
    setValue("activeBlockIndex", nextActiveIdx, { shouldDirty: true });
    setValue("workoutPlans", nextBlocks[nextCurrentIdx]?.workoutPlans || [], { shouldDirty: true });
    setValue("tips", nextBlocks[nextCurrentIdx]?.tips || [], { shouldDirty: true });
    setCurrentBlockIndex(nextCurrentIdx);
    toast.success("בלוק נמחק בהצלחה");
  };

  const handleSetActive = (index: number) => {
    setValue("activeBlockIndex", index, { shouldDirty: true });
    toast.success(`בלוק ${index + 1} סומן כפעיל`);
  };

  const handleDuplicateBlock = (index: number) => {
    persistCurrentBlock();
    const currentBlocks = (getValues("blocks") as IWorkoutBlock[]) || [];
    if (currentBlocks.length >= 8) return;
    const source = currentBlocks[index];
    if (!source) return;
    const clonedPlans: IWorkoutPlan[] = source.workoutPlans.map((wp) => ({
      ...wp,
      _id: generateUUID(),
      muscleGroups: wp.muscleGroups.map((mg) => ({
        ...mg,
        _id: generateUUID(),
        exercises: mg.exercises.map((ex) => ({
          ...ex,
          _id: generateUUID(),
          sets: ex.sets.map((s) => ({ ...s, _id: generateUUID() })),
        })),
      })),
    }));
    const duplicate: IWorkoutBlock = {
      id: generateUUID(),
      status: source.status,
      name: source.name,
      workoutPlans: clonedPlans,
      tips: source.tips ? [...source.tips] : undefined,
    };
    const nextBlocks = [...currentBlocks, duplicate];
    setValue("blocks", nextBlocks, { shouldDirty: true });
    toast.success(`בלוק ${index + 1} שוכפל לבלוק ${nextBlocks.length}`);
  };

  const handleSetStatus = (index: number, status: WorkoutBlockStatus | undefined) => {
    const currentBlocks = (getValues("blocks") as IWorkoutBlock[]) || [];
    const nextBlocks = currentBlocks.map((b, i) => (i === index ? { ...b, status } : b));
    setValue("blocks", nextBlocks, { shouldDirty: true });
  };

  const handleReorderBlocks = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    persistCurrentBlock();
    const currentBlocks = (getValues("blocks") as IWorkoutBlock[]) || [];
    if (fromIndex < 0 || fromIndex >= currentBlocks.length) return;
    if (toIndex < 0 || toIndex >= currentBlocks.length) return;
    const nextBlocks = [...currentBlocks];
    const [moved] = nextBlocks.splice(fromIndex, 1);
    nextBlocks.splice(toIndex, 0, moved);

    const adjustIndex = (idx: number) => {
      if (idx === fromIndex) return toIndex;
      if (fromIndex < idx && idx <= toIndex) return idx - 1;
      if (toIndex <= idx && idx < fromIndex) return idx + 1;
      return idx;
    };

    setValue("blocks", nextBlocks, { shouldDirty: true });
    setValue("activeBlockIndex", adjustIndex(activeBlockIndex ?? 0), { shouldDirty: true });
    setCurrentBlockIndex(adjustIndex(currentBlockIndex));
  };

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
          header={<WorkoutModeToggle mode={mode} onChange={handleModeChange} />}
          blocksBar={
            mode === "blocks" ? (
              <WorkoutBlocksBar
                blocks={blocks}
                currentBlockIndex={currentBlockIndex}
                activeBlockIndex={activeBlockIndex}
                onSelectBlock={handleSelectBlock}
                onAddBlock={handleAddBlock}
                onDeleteBlock={handleDeleteBlock}
                onDuplicateBlock={handleDuplicateBlock}
                onSetActive={handleSetActive}
                onSetStatus={handleSetStatus}
                onReorderBlocks={handleReorderBlocks}
              />
            ) : null
          }
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
