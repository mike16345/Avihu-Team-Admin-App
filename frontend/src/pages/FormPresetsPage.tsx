import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormResponsesTable from "@/components/tables/FormResponsesTable";
import SignedAgreementsTable from "@/components/agreements/SignedAgreementsTable";
import { useUrlTab } from "@/hooks/useUrlTab";
import QuestionnairesTable from "@/components/tables/QuestionnairesTable";
import { Button } from "@/components/ui/button";
import { FaClipboardList, FaInbox, FaFileSignature, FaArrowLeft } from "react-icons/fa6";

const tabs = ["forms", "responses", "agreements"];

const TAB_META: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
  forms: {
    title: "שאלונים",
    subtitle: "תבניות שאלונים שאתה שולח למתאמנים — התחלה, חודשי ומתוזמן",
    icon: <FaClipboardList size={18} />,
  },
  responses: {
    title: "תשובות",
    subtitle: "תשובות שהתקבלו מהמתאמנים על השאלונים",
    icon: <FaInbox size={18} />,
  },
  agreements: {
    title: "הסכמים חתומים",
    subtitle: "הסכמי השירות שמתאמנים חתמו עליהם בהצטרפות",
    icon: <FaFileSignature size={18} />,
  },
};

const FormPresetsPage = () => {
  const navigate = useNavigate();
  const { tab, setTab } = useUrlTab({ defaultTab: "forms", tabs });
  const current = TAB_META[tab] ?? TAB_META.forms;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-5 p-1"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
      data-testid="form-presets-page"
    >
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md">
            {current.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {current.title}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{current.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="inline-flex h-11 items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
          <TabsTrigger
            value="forms"
            className="gap-2 rounded-lg px-4 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <FaClipboardList size={12} />
            שאלונים
          </TabsTrigger>
          <TabsTrigger
            value="responses"
            className="gap-2 rounded-lg px-4 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <FaInbox size={12} />
            תשובות
          </TabsTrigger>
          <TabsTrigger
            value="agreements"
            className="gap-2 rounded-lg px-4 py-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <FaFileSignature size={12} />
            הסכמים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="mt-4">
          <QuestionnairesTable />
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <FormResponsesTable paginationKey="responses" />
        </TabsContent>

        <TabsContent value="agreements" className="mt-4 flex flex-col gap-3">
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/agreements/current`)}
              className="gap-2"
            >
              להסכם נוכחי
              <FaArrowLeft size={10} />
            </Button>
          </div>
          <SignedAgreementsTable paginationKey="agreements" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormPresetsPage;
