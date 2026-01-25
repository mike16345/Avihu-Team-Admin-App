import { useEffect, useMemo, useState } from "react";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { useUsersStore } from "@/store/userStore";
import useAgreementsAdminApi, { SignedAgreementsParams } from "@/hooks/api/useAgreementsAdminApi";
import { SignedAgreement, SignedAgreementUser } from "@/interfaces/IAgreement";
import DateUtils from "@/lib/dateUtils";
import { IUser } from "@/interfaces/IUser";
import useAgreementsQuery from "@/hooks/queries/agreements/useAgreementsQuery";

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

  const { page, pageSize, setPage } = useUrlPagination({
    namespace: paginationKey ?? "agreements",
    defaultPage: 1,
    defaultPageSize: 10,
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

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
          const fullName = resolveUserName(row.userId);

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

  useEffect(() => {
    setPageCountState(data?.data?.totalPages);
  }, [data?.data?.totalPages]);

  if (!adminId) {
    return <ErrorPage message="לא נמצא מזהה מנהל לצורך טעינת ההסכמים." />;
  }

  if (isError) return <ErrorPage message={error.message} />;

  return (
    <DataTableHebrew
      data={signedAgreements}
      columns={columns}
      actionButton={null}
      handleSetData={() => {}}
      handleViewData={() => {}}
      handleDeleteData={() => {}}
      handleViewNestedData={() => {}}
      getRowClassName={() => ""}
      handleHoverOnRow={() => false}
      getRowId={(row) => row._id || ""}
      pageNumber={page}
      isLoadingNextPage={isLoading}
      pageCount={pageCount}
      onPageChange={setPage}
      paginationKey={paginationKey ?? "agreements"}
      rowClickMode="single"
    />
  );
};

export default SignedAgreementsTable;
