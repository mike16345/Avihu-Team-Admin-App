import React, { useState } from "react";
import { FaAppleWhole, FaClipboardCheck, FaPlus } from "react-icons/fa6";

type TabKey = "dietplan" | "tips" | "supplements";

interface DietplanTabsProps {
  dietplan: React.ReactNode;
  tips: React.ReactNode;
  supplements: React.ReactNode;
  dietplanToolbar?: React.ReactNode;
  presetLoader?: React.ReactNode;
}

const TABS: { id: TabKey; label: string; icon: React.ReactNode }[] = [
  { id: "dietplan", label: "תפריט", icon: <FaAppleWhole size={13} /> },
  { id: "tips", label: "דגשים", icon: <FaClipboardCheck size={13} /> },
  { id: "supplements", label: "תוספים", icon: <FaPlus size={13} /> },
];

const getTabButtonClassName = (isActive: boolean) => {
  const baseClassName =
    "inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-sm font-semibold transition-transform duration-150 hover:scale-105";

  if (isActive) return `${baseClassName} bg-blue-600 text-white shadow-sm scale-105`;

  return `${baseClassName} text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`;
};

const DietplanTabs: React.FC<DietplanTabsProps> = ({
  dietplan,
  tips,
  supplements,
  dietplanToolbar,
  presetLoader,
}) => {
  const [active, setActive] = useState<TabKey>("dietplan");

  return (
    <div dir="rtl" className="flex flex-col gap-4 border-t border-slate-100 pt-4 font-heebo dark:border-slate-800/60">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex w-fit items-center gap-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={getTabButtonClassName(isActive)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        {active === "dietplan" && dietplanToolbar}
        {active === "dietplan" && presetLoader}
      </div>

      <div>
        {active === "dietplan" && dietplan}
        {active === "tips" && tips}
        {active === "supplements" && supplements}
      </div>
    </div>
  );
};

export default DietplanTabs;
