import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import useWorkoutPlanPresetQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetQuery";
import { useNavigate, useParams } from "react-router-dom";
import { MainRoutes } from "@/enums/Routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/ui/CustomButton";
import BackLink from "@/components/ui/BackLink";
import useAddWorkoutPreset from "@/hooks/mutations/workouts/useAddWorkoutPreset";
import { Input } from "@/components/ui/input";
import { collectAllErrors, ValidationErrorEntry } from "@/lib/utils";
import WorkoutPresetPicker from "./WorkoutPresetPicker";
import ValidationErrorsDialog from "../../Alerts/ValidationErrorsDialog";
import { FaFolderOpen, FaDumbbell, FaTag } from "react-icons/fa6";
import useWorkoutPlanPresetsQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanPresetsQuery";
import { ISimpleCardioType, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { cleanWorkoutObject, parseErrorFromObject } from "@/utils/workoutPlanUtils";
import useUpdateWorkoutPlanPreset from "@/hooks/mutations/workouts/useUpdateWorkoutPlanPreset";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { WorkoutPresetSchemaType, workoutPresetSchema } from "@/schemas/workoutPlanSchema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { onSuccess } from "@/lib/query";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import PresetMetaPanel from "./PresetMetaPanel";

export const CreateWorkoutPresetWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const { id = "" } = useParams();
  const navigation = useNavigate();

  const form = useForm<WorkoutPresetSchemaType>({
    resolver: zodResolver(workoutPresetSchema),
    defaultValues: {
      name: "",
      workoutPlans: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
    },
  });
  const {
    formState: { isDirty },
    getValues,
    reset,
    handleSubmit,
  } = form;

  const { data: workoutPlanPresets } = useWorkoutPlanPresetsQuery();
  const { data } = useWorkoutPlanPresetQuery(id);

  const onMutateSuccess = () => {
    navigation(MainRoutes.WORKOUT_PLANS_PRESETS);
  };

  const onError = (error: any) => {
    const message = error?.data?.message || parseErrorFromObject(error?.data || "");

    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: message,
    });
  };

  const addWorkoutPreset = useAddWorkoutPreset({
    onSuccess: () => {
      onSuccess("תבנית נשמר בהצלחה!", [QueryKeys.WORKOUT_PRESETS]);
      onMutateSuccess();
    },
    onError,
  });
  const updateWorkoutPlanPreset = useUpdateWorkoutPlanPreset({
    onSuccess: () => {
      onSuccess("תבנית עודכן בהצלחה!", [QueryKeys.WORKOUT_PRESETS, QueryKeys.WORKOUT_PRESETS + id]);
      onMutateSuccess();
    },
    onError,
  });

  const [selectedPreset, setSelectedPreset] = useState("");
  const [openPresetPicker, setOpenPresetPicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorEntry[]>([]);

  const presetList = useMemo(
    () => workoutPlanPresets?.data || [],
    [workoutPlanPresets?.data]
  );

  const handleSelectPreset = (preset: IWorkoutPlanPreset) => {
    reset({
      name: getValues("name"),
      workoutPlans: preset.workoutPlans,
      cardio: preset.cardio || { type: "simple", plan: defaultSimpleCardioOption },
      // Carry meta fields over from the selected preset (optional, harmless)
      workoutsPerWeek: preset.workoutsPerWeek,
      durationMinutes: preset.durationMinutes,
      level: preset.level,
      goal: preset.goal,
      equipment: preset.equipment,
      muscleFocus: preset.muscleFocus,
      note: preset.note,
      limitations: preset.limitations,
    });
    setSelectedPreset(preset.name);
  };

  const onSubmit = (values: WorkoutPresetSchemaType) => {
    let workoutPlan = values;
    const cardioPlan = values.cardio.type == "simple" && (values.cardio.plan as ISimpleCardioType);

    if (cardioPlan) {
      const minsPerWorkout = cardioPlan.minsPerWeek / cardioPlan.timesPerWeek;

      workoutPlan = {
        ...values,
        cardio: {
          type: values.cardio.type,
          plan: {
            ...cardioPlan,
            minsPerWorkout,
          },
        },
      };
    }

    if (id) {
      updateWorkoutPlanPreset.mutate({ presetId: id, updatedPreset: workoutPlan });
    } else {
      addWorkoutPreset.mutate(workoutPlan);
    }
  };

  const onInvalidSubmit = (errors: any) => {
    const all = collectAllErrors(errors);
    if (all.length === 0) return;
    setValidationErrors(all);
  };

  useEffect(() => {
    if (!data) return;

    reset(data);
  }, [data]);

  useUnsavedChangesWarning(isDirty);

  return (
    <>
      <div
        dir="rtl"
        className="flex flex-col gap-5 p-4 h-full"
        style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
      >
        <BackLink to={MainRoutes.WORKOUT_PLANS_PRESETS} label="חזרה לרשימת התבניות" />

        {/* Hero header — matches the libraries (forms / templates /
            menus / leads) so the editor reads as part of the same
            family. Blue blob backdrop + brand-gradient icon + title
            with subtitle. */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
          <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
          <div className="relative flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
              <FaDumbbell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                תבנית אימון
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                בנה תבנית חוזרת לשימוש למתאמנים שלך — שם, מאפיינים, אימונים ואירובי
              </p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}>
            {/* Identity card — name + "copy from preset" in one tidy
                surface so the editor doesn't open with a lone naked
                input above everything else. */}
            <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="min-w-0">
                      <FormLabel className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <FaTag size={10} />
                        שם התבנית
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="לדוגמה: דחיפה־משיכה־רגליים · ABC · 4 ימים"
                          className="h-11 w-full rounded-xl border-blue-100/60 bg-blue-50/30 text-base font-semibold text-slate-800 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <FaFolderOpen size={10} />
                    העתק מתבנית קיימת
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenPresetPicker(true)}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-blue-100/60 bg-blue-50/30 px-4 text-sm font-bold text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-px dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:border-blue-700"
                  >
                    <FaFolderOpen size={12} />
                    {selectedPreset ? `תבנית: ${selectedPreset}` : "בחר תבנית"}
                  </button>
                </div>
              </div>
            </div>

            {/* Meta-data panel — workouts/week, duration, level, goal, note, limitations */}
            <PresetMetaPanel />

            <div className="border-b-2 rounded">{children}</div>
            <div className="flex sm:justify-end py-1.5 sm:sticky sm:bottom-0">
              <CustomButton
                className="w-full sm:w-32"
                variant="success"
                type="submit"
                title="שמור תוכנית אימון"
                disabled={addWorkoutPreset.isPending || updateWorkoutPlanPreset.isPending}
                isLoading={addWorkoutPreset.isPending || updateWorkoutPlanPreset.isPending}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* Rich preset picker */}
      <WorkoutPresetPicker
        open={openPresetPicker}
        onOpenChange={setOpenPresetPicker}
        presets={presetList}
        onSelect={handleSelectPreset}
      />

      {/* Validation summary */}
      <ValidationErrorsDialog
        open={validationErrors.length > 0}
        onOpenChange={(open) => !open && setValidationErrors([])}
        errors={validationErrors}
        intro="יש לתקן את השדות הבאים לפני שמירת התבנית"
      />
    </>
  );
};
