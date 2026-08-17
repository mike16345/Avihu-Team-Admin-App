import { FaBookOpen, FaUtensils } from "react-icons/fa6";
import DietPlanVersionSwitch from "@/components/DietPlanV2/DietPlanVersionSwitch";
import { Button } from "@/components/ui/button";

interface DietPlanTemplatesHeaderProps {
  presetsOnly?: boolean;
  version?: 1 | 2;
  onVersionChange?: (version: 1 | 2) => void;
  onCatalogClick?: () => void;
}

const DietPlanTemplatesHeader: React.FC<DietPlanTemplatesHeaderProps> = ({
  presetsOnly = false,
  version,
  onVersionChange,
  onCatalogClick,
}) => (
  <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
    <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-950/30" />
    <div className="relative flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
        <FaUtensils size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">תפריטים</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {presetsOnly
            ? "כל תבניות התזונה השמורות שלך במקום אחד"
            : "ניהול תפריטי תזונה ומאגר המזון — חלבונים, פחמימות, ירקות ושומנים"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onCatalogClick && (
          <Button variant="outline" className="gap-2" onClick={onCatalogClick}>
            <FaBookOpen size={14} />
            מאגר תזונתי
          </Button>
        )}
        {version && onVersionChange && (
          <DietPlanVersionSwitch value={version} onChange={onVersionChange} />
        )}
      </div>
    </div>
  </div>
);

export default DietPlanTemplatesHeader;
