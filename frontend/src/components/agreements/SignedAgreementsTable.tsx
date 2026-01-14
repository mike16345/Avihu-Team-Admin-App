import { useMemo, useState } from "react";
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
import useAgreementsAdminApi, {
  SignedAgreementsParams,
} from "@/hooks/api/useAgreementsAdminApi";
import { SignedAgreement } from "@/interfaces/IAgreement";
import DateUtils from "@/lib/dateUtils";
import CustomSelect from "@/components/ui/CustomSelect";

const PAGE_SIZE_OPTIONS = [
  { name: "10", value: "10" },
  { name: "20", value: "20" },
  { name: "50", value: "50" },
];

const SignedAgreementsTable = () => {
  const currentUser = useUsersStore((state) => state.currentUser);
  const adminId = currentUser?._id;
  const { getSignedAgreements, getSignedAgreementDownloadUrl } = useAgreementsAdminApi();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({ userId: "", from: "", to: "" });
  const [appliedFilters, setAppliedFilters] = useState({ userId: "", from: "", to: "" });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const queryParams: SignedAgreementsParams = {
    adminId,
    page,
    limit,
    userId: appliedFilters.userId || undefined,
    from: appliedFilters.from || undefined,
    to: appliedFilters.to || undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.AGREEMENTS_SIGNED, queryParams],
    queryFn: () => getSignedAgreements(queryParams),
    enabled: Boolean(adminId),
  });

  const signedAgreements = data?.data?.results ?? [];
  const pageCount = data?.data?.totalPages ?? 1;

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
          const fullName = row.user
            ? `${row.user.firstName || ""} ${row.user.lastName || ""}`.trim()
            : "";
          return fullName || row.userId || "לא ידוע";
        },
        cell: ({ row }) => {
          const fullName = row.original.user
            ? `${row.original.user.firstName || ""} ${row.original.user.lastName || ""}`.trim()
            : "";
          return <span>{fullName || row.original.userId || "-"}</span>;
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
    const empty = { userId: "", from: "", to: "" };
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
          <Input
            type="date"
            value={filters.from}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            className="h-9 w-44"
          />
          <Input
            type="date"
            value={filters.to}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            className="h-9 w-44"
          />
          <CustomSelect
            className="h-9 w-28"
            items={PAGE_SIZE_OPTIONS}
            selectedValue={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
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
      rowClickMode="single"
    />
  );
};

export default SignedAgreementsTable;
