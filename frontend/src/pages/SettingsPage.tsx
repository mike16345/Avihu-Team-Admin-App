import { useMemo } from "react";
import { NavLink, Navigate, useLocation } from "react-router-dom";
import BlockBackgroundsPage from "@/pages/BlockBackgroundsPage";
import BlockTipDefaultsPage from "@/pages/BlockTipDefaultsPage";
import DietTipGoalsPage from "@/pages/DietTipGoalsPage";

type SettingsSubSection = {
  id: string;
  label: string;
  path: string;
  element: JSX.Element;
};

type SettingsSection = {
  id: string;
  title: string;
  subSections: SettingsSubSection[];
};

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "workout",
    title: "אימון",
    subSections: [
      {
        id: "block-backgrounds",
        label: "עיצוב בלוקים",
        path: "/settings/workout/block-backgrounds",
        element: <BlockBackgroundsPage />,
      },
      {
        id: "block-tip-defaults",
        label: "דגשים - אימונים",
        path: "/settings/workout/block-tip-defaults",
        element: <BlockTipDefaultsPage />,
      },
    ],
  },
  {
    id: "nutrition",
    title: "תזונה",
    subSections: [
      {
        id: "diet-tip-goals",
        label: "דגשים לפי מטרה",
        path: "/settings/nutrition/diet-tip-goals",
        element: <DietTipGoalsPage />,
      },
    ],
  },
];

const flatSubSections = SETTINGS_SECTIONS.flatMap((s) => s.subSections);

const SettingsPage = () => {
  const location = useLocation();

  const activePath = location.pathname;

  const active = useMemo(
    () => flatSubSections.find((s) => s.path === activePath),
    [activePath]
  );

  if (!active && activePath === "/settings") {
    return <Navigate to={flatSubSections[0].path} replace />;
  }

  return (
    <div dir="rtl" className="flex min-h-full flex-col gap-6 font-heebo">
      <header className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          הגדרות
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          הגדרות פרסונליות של החשבון שלך. חלות על כל המתאמנים ותת־המאמנים שלך.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 md:flex-row">
        <aside className="md:w-56">
          <nav className="flex flex-col gap-4">
            {SETTINGS_SECTIONS.map((section) => (
              <div key={section.id} className="flex flex-col gap-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.title}
                </div>
                {section.subSections.map((sub) => (
                  <NavLink
                    key={sub.id}
                    to={sub.path}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`
                    }
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 rounded-2xl bg-white shadow-sm dark:bg-slate-900">
          {active ? active.element : flatSubSections[0].element}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
