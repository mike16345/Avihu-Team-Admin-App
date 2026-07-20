import { useMemo, useState } from "react";
import {
  FaBullseye,
  FaChevronDown,
  FaLeaf,
  FaNoteSticky,
  FaTags,
  FaUser,
  FaVenusMars,
} from "react-icons/fa6";

import {
  Field,
  GhostChip,
  SummaryChip,
} from "@/components/templates/workoutTemplates/PresetMetaPanelPrimitives";
import { getPillClassName } from "@/components/templates/workoutTemplates/presetMetaPanelStyles";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import { useUsersStore } from "@/store/userStore";

import {
  TEMPLATE_DIET_TAG_LABELS,
  TEMPLATE_GENDER_LABELS,
  TEMPLATE_GOAL_LABELS,
  type DietV2DietTag,
  type DietV2TemplateGender,
  type DietV2TemplateGoal,
} from "./dietPlanV2Templates";

export interface DietV2TemplateMetaValues {
  goal: DietV2TemplateGoal | "";
  targetGender: DietV2TemplateGender | "";
  dietTags: DietV2DietTag[];
  builtBy: string;
  notes: string;
}

interface Props {
  values: DietV2TemplateMetaValues;
  onChange: (patch: Partial<DietV2TemplateMetaValues>) => void;
}

const countFilled = (v: DietV2TemplateMetaValues): number => {
  let count = 0;
  if (v.goal) count += 1;
  if (v.targetGender) count += 1;
  if (v.dietTags.length > 0) count += 1;
  if (v.builtBy.trim()) count += 1;
  if (v.notes.trim()) count += 1;

  return count;
};

const getFilledLabel = (filled: number): string => {
  if (filled > 0) return `${filled} מאפיינים תויגו`;
  return "כל המאפיינים אופציונליים";
};

const getToggleLabel = (expanded: boolean): string => {
  if (expanded) return "סגור";
  return "ערוך תיוג";
};

const getCurrentUserName = (u: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): string => {
  const name = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  if (name) return name;
  return u.email ?? "אני";
};

const DietPlanV2TemplateMetaPanel: React.FC<Props> = ({ values, onChange }) => {
  const currentUser = useUsersStore((s) => s.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();

  const [expanded, setExpanded] = useState(false);

  const builderOptions = useMemo(() => {
    const list: string[] = [];
    if (currentUser) list.push(getCurrentUserName(currentUser));
    subTrainers.forEach((t) => {
      if (t.fullName && !list.includes(t.fullName)) list.push(t.fullName);
    });
    if (values.builtBy.trim() && !list.includes(values.builtBy)) {
      list.unshift(values.builtBy);
    }

    return list;
  }, [currentUser, subTrainers, values.builtBy]);

  const selfName = currentUser ? getCurrentUserName(currentUser) : "";

  const filled = countFilled(values);
  const goalLabel = values.goal ? TEMPLATE_GOAL_LABELS[values.goal] : "";
  const genderLabel = values.targetGender ? TEMPLATE_GENDER_LABELS[values.targetGender] : "";

  const openAndExpand = () => setExpanded(true);

  const toggleTag = (tag: DietV2DietTag) => {
    const next = values.dietTags.includes(tag)
      ? values.dietTags.filter((t) => t !== tag)
      : [...values.dietTags, tag];
    onChange({ dietTags: next });
  };

  const pickGoal = (goal: DietV2TemplateGoal) => {
    onChange({ goal: values.goal === goal ? "" : goal });
  };

  const pickGender = (gender: DietV2TemplateGender) => {
    onChange({ targetGender: values.targetGender === gender ? "" : gender });
  };

  return (
    <section
      dir="rtl"
      className="overflow-hidden rounded-2xl border border-blue-100/60 bg-white font-heebo shadow-sm dark:border-blue-900/40 dark:bg-slate-900"
    >
      <header
        className={`relative flex flex-wrap items-center gap-2.5 bg-gradient-to-l from-blue-50/60 via-white to-blue-50/30 px-4 py-3 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/20 ${
          expanded ? "border-b border-blue-100/60 dark:border-blue-900/40" : ""
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-blue-500/25">
          <FaTags size={13} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">מאפייני התבנית</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{getFilledLabel(filled)}</p>
        </div>

        {!expanded && (
          <div className="flex flex-wrap items-center gap-1.5">
            {goalLabel ? (
              <SummaryChip icon={<FaBullseye size={9} />} label={goalLabel} onClick={openAndExpand} />
            ) : (
              <GhostChip label="מטרה" onClick={openAndExpand} />
            )}
            {genderLabel ? (
              <SummaryChip icon={<FaVenusMars size={9} />} label={genderLabel} onClick={openAndExpand} />
            ) : (
              <GhostChip label="מין" onClick={openAndExpand} />
            )}
            {values.dietTags.length > 0 ? (
              values.dietTags.map((tag) => (
                <SummaryChip
                  key={tag}
                  icon={<FaLeaf size={9} />}
                  label={TEMPLATE_DIET_TAG_LABELS[tag]}
                  onClick={openAndExpand}
                />
              ))
            ) : (
              <GhostChip label="אלרגיות / הגבלות" onClick={openAndExpand} />
            )}
            {values.builtBy.trim() && (
              <SummaryChip icon={<FaUser size={9} />} label={values.builtBy} onClick={openAndExpand} />
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
          className="ms-auto inline-flex h-9 items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 shadow-sm transition-all hover:-translate-y-px hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
        >
          {getToggleLabel(expanded)}
          <FaChevronDown
            size={10}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </header>

      {expanded && (
        <div className="grid grid-cols-1 bg-gradient-to-b from-white via-blue-50/10 to-white lg:grid-cols-2 dark:from-slate-900 dark:via-blue-950/10 dark:to-slate-900">
          <div className="px-5 lg:border-l lg:border-blue-100/40 lg:dark:border-blue-900/30">
            <Field icon={<FaBullseye size={11} />} label="מטרה">
              <div className="flex flex-wrap gap-1">
                {(Object.keys(TEMPLATE_GOAL_LABELS) as DietV2TemplateGoal[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pickGoal(key)}
                    className={getPillClassName(values.goal === key)}
                  >
                    {TEMPLATE_GOAL_LABELS[key]}
                  </button>
                ))}
              </div>
            </Field>

            <Field icon={<FaVenusMars size={11} />} label="מין המתאמן" isLast>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(TEMPLATE_GENDER_LABELS) as DietV2TemplateGender[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pickGender(key)}
                    className={getPillClassName(values.targetGender === key)}
                  >
                    {TEMPLATE_GENDER_LABELS[key]}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="px-5">
            <Field icon={<FaUser size={11} />} label="נבנה ע״י">
              <BuilderSelect
                value={values.builtBy}
                options={builderOptions}
                selfName={selfName}
                onChange={(v) => onChange({ builtBy: v })}
              />
            </Field>

            <Field icon={<FaNoteSticky size={11} />} label="הערות">
              <textarea
                value={values.notes}
                onChange={(e) => onChange({ notes: e.target.value })}
                rows={2}
                placeholder="מתי להשתמש בתבנית — שלב הדיאטה, סוג האימון וכו׳"
                className="min-h-[64px] w-full resize-none rounded-xl border border-blue-100/60 bg-blue-50/30 p-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-200 dark:focus:bg-slate-900"
              />
            </Field>

            <Field icon={<FaLeaf size={11} />} label="אלרגיות / הגבלות" isLast>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(TEMPLATE_DIET_TAG_LABELS) as DietV2DietTag[]).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={getPillClassName(values.dietTags.includes(tag))}
                  >
                    {TEMPLATE_DIET_TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>
      )}
    </section>
  );
};

interface BuilderSelectProps {
  value: string;
  options: string[];
  selfName: string;
  onChange: (v: string) => void;
}

const BuilderSelect: React.FC<BuilderSelectProps> = ({
  value,
  options,
  selfName,
  onChange,
}) => (
  <span className="relative block">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full cursor-pointer appearance-none rounded-xl border border-blue-100/60 bg-blue-50/40 pe-3 ps-8 text-sm font-semibold text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-slate-200 dark:focus:bg-slate-900"
    >
      <option value="">לא נבחר</option>
      {options.map((name) => (
        <option key={name} value={name}>
          {name === selfName ? `${name} (אני)` : name}
        </option>
      ))}
    </select>
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-500 ltr:right-3 rtl:left-3"
    >
      <path
        fillRule="evenodd"
        d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
        clipRule="evenodd"
      />
    </svg>
  </span>
);

export default DietPlanV2TemplateMetaPanel;
