import { useEffect, useMemo, useState } from "react";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import type { DateRange } from "react-day-picker";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { useUsersStore } from "@/store/userStore";
import { QueryKeys } from "@/enums/QueryKeys";
import useAgreementsAdminApi, { SignedAgreementsParams } from "@/hooks/api/useAgreementsAdminApi";
import { SignedAgreement, SignedAgreementUser } from "@/interfaces/IAgreement";
import DateUtils from "@/lib/dateUtils";
import CustomSelect from "@/components/ui/CustomSelect";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { IUser } from "@/interfaces/IUser";

export const getFullUserName = (user: Partial<IUser> | undefined) => {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
};

export const resolveUserName = (user: string | SignedAgreementUser | undefined) => {
  return user && isUserIdObject(user) ? getFullUserName(user) : "";
};

export const isUserIdObject = (user: string | SignedAgreementUser | undefined) => {
  return typeof user == "object" && typeof user !== "string";
};

const PAGE_SIZE_OPTIONS = [
  { name: "10", value: "10" },
  { name: "20", value: "20" },
  { name: "50", value: "50" },
];

type SignedAgreementsTableProps = {
  paginationKey?: string;
};

const SignedAgreementsTable = ({ paginationKey }: SignedAgreementsTableProps) => {
  const currentUser = useUsersStore((state) => state.currentUser);
  const adminId = currentUser?._id;
  const { getSignedAgreements, getSignedAgreementDownloadUrl } = useAgreementsAdminApi();

  const [pageCountState, setPageCountState] = useState<number | undefined>(undefined);

  const { page, pageSize, setPage, setPageSize } = useUrlPagination({
    namespace: paginationKey ?? "agreements",
    defaultPage: 1,
    defaultPageSize: 10,
    totalPages: pageCountState,
  });

  const [filters, setFilters] = useState<{ userId: string; range?: DateRange }>({
    userId: "",
    range: undefined,
  });
  const [appliedFilters, setAppliedFilters] = useState<{ userId: string; range?: DateRange }>({
    userId: "",
    range: undefined,
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const queryParams: SignedAgreementsParams = {
    adminId,
    page,
    limit: pageSize,
    userId: appliedFilters.userId || undefined,
    from: appliedFilters.range?.from
      ? DateUtils.formatDate(appliedFilters.range.from, "YYYY-MM-DD")
      : undefined,
    to: appliedFilters.range?.to
      ? DateUtils.formatDate(appliedFilters.range.to, "YYYY-MM-DD")
      : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.AGREEMENTS_SIGNED, queryParams],
    queryFn: () => getSignedAgreements(queryParams),
    enabled: Boolean(adminId),
  });

  const signedAgreements = data?.data?.results ?? [];
  const pageCount = data?.data?.totalPages ?? 1;

  useEffect(() => {
    setPageCountState(data?.data?.totalPages);
  }, [data?.data?.totalPages]);

  const handleDownload = async (agreement: SignedAgreement) => {
    if (!agreement._id) {
      toast.error("לא ניתן להוריד את ההסכם.");
      return;
    }

    try {
      setDownloadingId(agreement._id);
      const response = await getSignedAgreementDownloadUrl({ id: agreement._id, adminId });
      const downloadUrl = response.data.downloadUrl;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (downloadError: any) {
      toast.error("הורדת ההסכם נכשלה", {
        description: downloadError?.data?.message,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = useMemo<ColumnDef<SignedAgreement>[]>(
    () => [
      {
        id: "שם",
        header: "משתמש",
        accessorFn: (row) => {
          const fullName = resolveUserName(row);

          return fullName || row.userId || "לא ידוע";
        },
        cell: ({ row }) => {
          const fullName = resolveUserName(row.original.userId || "");

          return <span>{fullName || "-"}</span>;
        },
      },
      {
        header: "תאריך חתימה",
        accessorKey: "signedAt",
        cell: ({ row }) => {
          const value = row.original.signedAt || row.original.createdAt;
          return value ? DateUtils.formatDate(value, "DD/MM/YYYY HH:mm") : "-";
        },
      },
      {
        header: "גרסה",
        accessorKey: "version",
        cell: ({ row }) => row.original.version ?? row.original.agreementVersion ?? "-",
      },
      {
        header: "סטטוס",
        cell: ({ row }) => (row.original.signedPdfS3Key ? "חתום" : "שגיאה"),
      },
      {
        header: "פעולות",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload(row.original)}
            disabled={downloadingId === row.original._id}
          >
            {downloadingId === row.original._id ? "מוריד..." : "הורדת PDF"}
          </Button>
        ),
      },
    ],
    [downloadingId]
  );

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleResetFilters = () => {
    const empty = { userId: "", range: undefined };
    setFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
  };

  if (!adminId) {
    return <ErrorPage message="לא נמצא מזהה מנהל לצורך טעינת ההסכמים." />;
  }

  if (isLoading) return <Loader size="large" />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <DataTableHebrew
      data={signedAgreements}
      columns={columns}
      actionButton={null}
      filters={
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="חיפוש לפי מזהה משתמש"
            value={filters.userId}
            onChange={(event) => setFilters((prev) => ({ ...prev, userId: event.target.value }))}
            className="h-9 w-56"
          />
          <DateRangePicker
            selectedRange={filters.range}
            onChangeRange={(range) => setFilters((prev) => ({ ...prev, range }))}
            className="w-64"
          />
          <CustomSelect
            className="h-9 w-28"
            items={PAGE_SIZE_OPTIONS}
            selectedValue={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
            }}
          />
          <Button variant="outline" onClick={handleApplyFilters}>
            סנן
          </Button>
          <Button variant="ghost" onClick={handleResetFilters}>
            נקה
          </Button>
        </div>
      }
      handleSetData={() => {}}
      handleViewData={() => {}}
      handleDeleteData={() => {}}
      handleViewNestedData={() => {}}
      getRowClassName={() => ""}
      handleHoverOnRow={() => false}
      getRowId={(row) => row._id || ""}
      pageNumber={page}
      pageCount={pageCount}
      onPageChange={setPage}
      paginationKey={paginationKey ?? "agreements"}
      rowClickMode="single"
    />
  );
};

export default SignedAgreementsTable;
