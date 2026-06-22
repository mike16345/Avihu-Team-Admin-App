import { useCallback, useEffect, useMemo, useState } from "react";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ErrorPage from "@/pages/ErrorPage";
import { useUsersStore } from "@/store/userStore";
import useAgreementsAdminApi, { SignedAgreementsParams } from "@/hooks/api/useAgreementsAdminApi";
import { SignedAgreement, SignedAgreementUser } from "@/interfaces/IAgreement";
import DateUtils from "@/lib/dateUtils";
import { IUser } from "@/interfaces/IUser";
import useAgreementsQuery from "@/hooks/queries/agreements/useAgreementsQuery";
import Loader from "@/components/ui/Loader";
import {
  FaMagnifyingGlass,
  FaFileSignature,
  FaCircleCheck,
  FaTriangleExclamation,
  FaChevronLeft,
  FaChevronRight,
  FaFilePdf,
} from "react-icons/fa6";
import { UserAvatar } from "../users/UserAvatar";

export const getFullUserName = (user: Partial<IUser> | undefined) => {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
};

export const resolveUserName = (user: string | SignedAgreementUser | undefined) => {
  return user && isUserIdObject(user) ? getFullUserName(user) : "";
};

export const isUserIdObject = (user: string | SignedAgreementUser | undefined) => {
  return typeof user == "object" && typeof user !== "string";
};

type SignedAgreementsTableProps = {
  paginationKey?: string;
};

const SignedAgreementsTable = ({ paginationKey }: SignedAgreementsTableProps) => {
  const { getSignedAgreementDownloadUrl } = useAgreementsAdminApi();
  const currentUser = useUsersStore((state) => state.currentUser);
  const adminId = currentUser?._id;

  const [pageCountState, setPageCountState] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { page, pageSize, setPage } = useUrlPagination({
    namespace: paginationKey ?? "agreements",
    defaultPage: 1,
    defaultPageSize: 20,
    totalPages: pageCountState,
  });

  const queryParams: SignedAgreementsParams = {
    adminId,
    page,
    limit: pageSize,
  };

  const { data, isLoading, isError, error } = useAgreementsQuery(adminId, queryParams);

  const signedAgreements = data?.data?.results ?? [];
  const pageCount = data?.data?.totalPages ?? 1;

  const [openingId, setOpeningId] = useState<string | null>(null);
  const handleViewPdf = useCallback(
    async (agreement: SignedAgreement) => {
      if (!agreement._id) {
        toast.error("לא ניתן להוריד את ההסכם.");
        return;
      }

      const popup = window.open("", "_blank");
      if (popup) popup.opener = null;

      try {
        setOpeningId(agreement._id);
        const response = await getSignedAgreementDownloadUrl({ id: agreement._id, adminId });
        const downloadUrl = response.data.downloadUrl;

        if (popup) {
          popup.location.href = downloadUrl;
        } else {
          window.location.href = downloadUrl;
        }
      } catch (downloadError: any) {
        popup?.close();
        toast.error("הורדת ההסכם נכשלה", {
          description: downloadError?.data?.message,
        });
      } finally {
        setOpeningId(null);
      }
    },
    [adminId, getSignedAgreementDownloadUrl]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return signedAgreements;
    return signedAgreements.filter((a) => {
      const name = resolveUserName(a.userId).toLowerCase();
      return name.includes(q);
    });
  }, [signedAgreements, search]);

  useEffect(() => {
    setPageCountState(data?.data?.totalPages);
  }, [data?.data?.totalPages]);

  if (!adminId) {
    return <ErrorPage message="לא נמצא מזהה מנהל לצורך טעינת ההסכמים." />;
  }
  if (isError && (error as any)?.status == 500) return <ErrorPage message={error.message} />;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1 max-w-[360px]">
          <FaMagnifyingGlass
            size={11}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם מתאמן…"
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? "הסכם" : "הסכמים"}
          {filtered.length !== signedAgreements.length && ` מתוך ${signedAgreements.length}`}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size="large" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 shadow-sm">
              <FaFileSignature size={18} />
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-200">
              {signedAgreements.length === 0 ? "אין עדיין הסכמים חתומים" : "לא נמצאו תוצאות"}
            </p>
            {signedAgreements.length === 0 && (
              <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                ברגע שמתאמן יחתום על הסכם השירות בהצטרפות — הוא יופיע כאן
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1.4fr_1.1fr_0.6fr_0.7fr_0.6fr] gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <div>משתמש</div>
              <div>תאריך חתימה</div>
              <div className="text-center">גרסה</div>
              <div className="text-center">סטטוס</div>
              <div className="text-left">פעולות</div>
            </div>

            {/* Rows */}
            <ul>
              {filtered.map((agreement) => {
                const fullName = resolveUserName(agreement.userId);
                const display = fullName || "ללא שם";
                const signedAt = agreement.signedAt || agreement.createdAt;
                const dateStr = signedAt ? DateUtils.formatDate(signedAt, "DD/MM/YYYY") : "-";
                const timeStr = signedAt
                  ? new Date(signedAt).toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null;
                const version = agreement.version ?? agreement.agreementVersion ?? "-";
                const isSigned = !!agreement.signedPdfS3Key;

                return (
                  <li
                    key={agreement._id}
                    className="grid grid-cols-[1.4fr_1.1fr_0.6fr_0.7fr_0.6fr] items-center gap-3 border-b border-slate-100 dark:border-slate-800/60 px-4 py-3 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 last:border-b-0"
                  >
                    {/* User */}
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        user={typeof agreement.userId == "object" ? agreement.userId : null}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full brand-gradient text-white text-xs font-bold shadow-sm"
                      />
                      <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {display}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {dateStr}
                      </span>
                      {timeStr && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {timeStr}
                        </span>
                      )}
                    </div>

                    {/* Version */}
                    <div className="flex justify-center">
                      <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        {version}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <FaCircleCheck size={10} />
                          חתום
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                          <FaTriangleExclamation size={10} />
                          שגיאה
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPdf(agreement)}
                        disabled={openingId === agreement._id || !isSigned}
                        className="gap-1.5 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                      >
                        <FaFilePdf size={11} />
                        {openingId === agreement._id ? "פותח…" : "הצג PDF"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            דף {page} מתוך {pageCount}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-blue-950/40"
              aria-label="הקודם"
            >
              <FaChevronRight size={11} />
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount, page + 1))}
              disabled={page >= pageCount}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-blue-950/40"
              aria-label="הבא"
            >
              <FaChevronLeft size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignedAgreementsTable;
