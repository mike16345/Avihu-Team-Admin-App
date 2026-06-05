/**
 * WeightProgressionPhotos — תמונות התקדמות
 *
 *  - Bulk upload via header button
 *  - Per-slot upload for missing angles (placeholder card)
 *  - Per-photo delete + replace (hover overlay).
 *    Delete strategy:
 *      • Server: call DELETE /s3/photos/one with `photoId: "images/<key>"` and
 *        `userId`. This endpoint is already deployed and removes the file
 *        from S3. The newer version of the handler (not yet deployed) also
 *        pulls the URL from MongoDB.
 *      • Client: until the server-side MongoDB cleanup ships, we maintain a
 *        local "hidden keys" list in localStorage so the gallery doesn't
 *        show broken images after a delete + refresh.
 *  - Click a photo to open the compare modal
 */
import { FC, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FaCamera, FaXmark, FaShare, FaArrowsRotate, FaTrash } from "react-icons/fa6";
import { FaUpload } from "react-icons/fa";
import Loader from "@/components/ui/Loader";
import useUserWeighInPhotosQuery from "@/hooks/queries/weighInPhotos/useUserWeighInPhotosQuery";
import { sendData, deleteItem } from "@/API/api";
import { determineServerUrl } from "@/config/apiConfig";
import { ApiResponse } from "@/types/types";

// Kept for backward compatibility with useWeighInPhotosApi (and any imports)
export type Photo = { url?: string; _id?: string; date?: string };

const ANGLE_LABELS = ["מלפנים", "מאחור", "מהצד ימין", "מהצד שמאל"];

type PhotoSlot = { label: string; url?: string; storageKey?: string };
type PhotoGroup = {
  cycleNumber: number;
  uploadDate?: string; // DD/MM/YYYY — extracted from the storage key
  photos: PhotoSlot[];
};

/**
 * Local "hidden" photo keys per user. Populated when the trainer deletes a
 * photo — the S3 object is gone, but MongoDB still has the URL until the
 * updated server is deployed. Without this hack, deleted photos would
 * resurrect on every page refresh and show as broken images.
 */
const HIDDEN_KEYS_STORAGE = "avihu_hidden_photo_keys";
function readHiddenKeys(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_KEYS_STORAGE);
    const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    return new Set(all[userId] || []);
  } catch {
    return new Set();
  }
}
function addHiddenKey(userId: string, key: string) {
  try {
    const raw = localStorage.getItem(HIDDEN_KEYS_STORAGE);
    const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    const list = new Set(all[userId] || []);
    list.add(key);
    all[userId] = Array.from(list);
    localStorage.setItem(HIDDEN_KEYS_STORAGE, JSON.stringify(all));
  } catch {
    /* localStorage unavailable — ignore */
  }
}

/** Storage keys look like `{userId}/{YYYY-MM-DD}/{filename}`. */
function extractUploadDate(storageKey?: string): string | undefined {
  if (!storageKey) return undefined;
  const parts = storageKey.split("/");
  const datePart = parts.length >= 3 ? parts[parts.length - 2] : undefined;
  if (!datePart) return undefined;
  // Convert YYYY-MM-DD → DD/MM/YYYY
  const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return datePart;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/**
 * Strip the CloudFront prefix from a full URL to get the storage key the
 * server actually stores (e.g. "{userId}/{date}/{imageName}"). If the URL
 * doesn't include `/images/`, returns it unchanged so we don't accidentally
 * try to delete something we can't identify.
 */
function extractStorageKey(fullUrl?: string): string | undefined {
  if (!fullUrl) return undefined;
  const marker = "/images/";
  const idx = fullUrl.indexOf(marker);
  if (idx < 0) return fullUrl;
  return fullUrl.slice(idx + marker.length);
}

/**
 * Group flat photo URLs into groups of 4 (one cycle per 4 photos).
 */
function groupPhotos(photos: string[]): PhotoGroup[] {
  if (!photos?.length) return [];
  const groups: PhotoGroup[] = [];
  for (let i = 0; i < photos.length; i += 4) {
    const batch = photos.slice(i, i + 4);
    const cycleNumber = Math.floor(i / 4) + 1;
    const slots: PhotoSlot[] = ANGLE_LABELS.map((label, idx) => ({
      label,
      url: batch[idx],
      storageKey: extractStorageKey(batch[idx]),
    }));
    // Use the first available storage key in the cycle for the upload date.
    const uploadDate = slots.map((s) => extractUploadDate(s.storageKey)).find(Boolean);
    groups.push({ cycleNumber, uploadDate, photos: slots });
  }
  // Newest cycle (highest cycleNumber) appears first.
  return groups.reverse();
}

export const WeightProgressionPhotos: FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: photos = [], isLoading } = useUserWeighInPhotosQuery(id);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareAngle, setCompareAngle] = useState(0);
  const [compareLeftGroup, setCompareLeftGroup] = useState<number>(0);
  const [compareRightGroup, setCompareRightGroup] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null); // storageKey of the photo being deleted/replaced
  // For per-photo "replace" we need an invisible file picker we can trigger programmatically.
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const pendingReplaceKeyRef = useRef<string | null>(null);

  // Filter out keys the trainer deleted locally but the server still returns
  // (until the MongoDB cleanup is deployed). We compare against each item's
  // storage key (stripping the CloudFront prefix).
  const visiblePhotos: string[] = useMemo(() => {
    if (!id) return photos as string[];
    const hidden = readHiddenKeys(id);
    if (hidden.size === 0) return photos as string[];
    return (photos as string[]).filter((url) => {
      const key = extractStorageKey(url);
      return !key || !hidden.has(key);
    });
  }, [photos, id]);

  const groups: PhotoGroup[] = useMemo(() => groupPhotos(visiblePhotos), [visiblePhotos]);

  const openCompareAtAngle = (angleIdx: number) => {
    if (groups.length < 2) return;
    setCompareAngle(angleIdx);
    setCompareLeftGroup(0);
    setCompareRightGroup(groups.length - 1);
    setCompareOpen(true);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [id + "-photos"] });
  };

  /**
   * Upload one or more photos to S3 and register their URLs with the user.
   * Returns the number of files that completed all 3 steps (signedUrl → S3 → DB).
   */
  const uploadFiles = async (files: FileList): Promise<number> => {
    if (!id || !files.length) return 0;
    // Snapshot the FileList into a plain array — the live FileList can be
    // emptied by `input.value = ""` while we're still iterating asynchronously,
    // which previously caused `files.length` to drop to 0 mid-upload and made
    // the toast show "failed: -1".
    const fileArr: File[] = Array.from(files);
    const total = fileArr.length;
    setUploading(true);
    const today = new Date().toISOString().split("T")[0];
    const apiBase = determineServerUrl();
    let uploaded = 0;
    let lastError: string | null = null;
    let authExpired = false;

    for (let i = 0; i < total; i++) {
      const file = fileArr[i];
      const imageName = `progress-${Date.now()}-${i}`;
      const signedUrlEndpoint = `${apiBase}/signedUrl?userId=${id}&date=${today}&imageName=${imageName}`;

      try {
        const signedRes = await fetch(signedUrlEndpoint, {
          method: "POST",
          headers: { "X-Api-Key": import.meta.env.VITE_API_AUTH_TOKEN },
        });
        if (!signedRes.ok) {
          lastError = `שגיאה בקבלת URL להעלאה (${signedRes.status})`;
          continue;
        }
        const { data: presignedUrl } = await signedRes.json();
        const uploadRes = await fetch(presignedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "image/jpeg" },
          body: file,
        });
        if (!uploadRes.ok) {
          lastError = `שגיאה בהעלאה ל-S3 (${uploadRes.status})`;
          continue;
        }
        const urlToStore = `${id}/${today}/${imageName}`;
        try {
          await sendData<ApiResponse<string[]>>("userImageUrls", {
            userId: id,
            imageUrl: urlToStore,
          });
          uploaded++;
        } catch (e: any) {
          const status = e?.status || e?.response?.status;
          if (status === 401) {
            authExpired = true;
            lastError = "ההתחברות פגה — צריך להתחבר מחדש";
            break;
          }
          lastError = `שגיאה ברישום ה-URL (${status || "?"})`;
        }
      } catch {
        lastError = "שגיאה לא צפויה בהעלאה";
      }
    }

    setUploading(false);
    const failed = total - uploaded;
    const photosWord = (n: number) => (n === 1 ? "תמונה אחת" : `${n} תמונות`);

    if (uploaded > 0) {
      refresh();
      if (failed === 0) {
        toast.success(
          uploaded === 1 ? "התמונה הועלתה בהצלחה!" : `${uploaded} תמונות הועלו בהצלחה!`
        );
      } else {
        toast.warning(
          `הועלו ${photosWord(uploaded)} · נכשלו ${photosWord(failed)}${
            lastError ? ` — ${lastError}` : ""
          }`
        );
      }
    } else {
      if (authExpired) {
        toast.error("ההתחברות פגה — התנתק והתחבר מחדש כדי להעלות תמונות");
      } else if (total === 1) {
        toast.error(lastError || "ההעלאה נכשלה");
      } else {
        toast.error(
          `כל ההעלאות נכשלו (${total} תמונות)${lastError ? ` — ${lastError}` : ""}`
        );
      }
    }
    return uploaded;
  };

  /**
   * Delete a photo via the existing `DELETE /s3/photos/one` endpoint.
   * The server takes `photoId` (the S3 Key, which is `images/<storageKey>`).
   * We also pass `userId` so the (updated) server can clean MongoDB too —
   * older deploys will just ignore it and only delete from S3.
   *
   * Until the server-side MongoDB cleanup is deployed, we add the key to
   * a localStorage "hidden" list so the photo doesn't reappear on refresh.
   */
  const deletePhoto = async (storageKey: string) => {
    if (!id || !storageKey) return false;
    const s3Key = `images/${storageKey}`;
    try {
      await deleteItem<ApiResponse<string>>(
        "s3/photos/one",
        undefined,
        undefined,
        { photoId: s3Key, userId: id }
      );
      // Always hide locally — this protects against the case where the
      // server deletes from S3 but the deployed Lambda doesn't yet remove
      // the URL from MongoDB. Once the server cleanup is live this becomes
      // a harmless no-op (the URL won't be returned anyway).
      addHiddenKey(id, storageKey);
      return true;
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      if (status === 401) {
        toast.error("ההתחברות פגה — התנתק והתחבר מחדש");
        return false;
      }
      if (status === 404 || status === 405) {
        toast.error("מחיקת תמונה אינה זמינה כרגע — צריך פריסת שרת");
        return false;
      }
      toast.error(`שגיאה במחיקת התמונה (${status || "?"})`);
      return false;
    }
  };

  const handleDelete = async (slot: PhotoSlot) => {
    if (!slot.storageKey) return;
    const ok = window.confirm(`למחוק את התמונה "${slot.label}"? פעולה זו אינה הפיכה.`);
    if (!ok) return;
    setBusyKey(slot.storageKey);
    const success = await deletePhoto(slot.storageKey);
    setBusyKey(null);
    if (success) {
      refresh();
      toast.success("התמונה נמחקה");
    }
  };

  const handleReplaceClick = (slot: PhotoSlot) => {
    if (!slot.storageKey) return;
    pendingReplaceKeyRef.current = slot.storageKey;
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChosen = async (files: FileList | null) => {
    const key = pendingReplaceKeyRef.current;
    pendingReplaceKeyRef.current = null;
    if (!key || !files || !files.length) return;
    setBusyKey(key);
    // Upload new → delete old (only if upload succeeded)
    const uploadedCount = await uploadFiles(files);
    if (uploadedCount > 0) {
      const deleted = await deletePhoto(key);
      if (deleted) {
        refresh();
        toast.success("התמונה הוחלפה");
      }
    }
    setBusyKey(null);
  };

  if (isLoading) return <Loader size="large" />;

  return (
    <div dir="rtl" style={{ fontFamily: "Heebo, system-ui, sans-serif" }}>
      {/* hidden input for the per-photo replace flow */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleReplaceFileChosen(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FaCamera size={16} className="text-blue-600" />
            <span className="text-lg font-bold">תמונות התקדמות</span>
          </div>
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition-all ${
              uploading
                ? "cursor-not-allowed bg-slate-400"
                : "bg-slate-900 hover:bg-slate-800 hover:shadow-lg"
            }`}
          >
            <FaUpload size={12} />
            <span>{uploading ? "מעלה..." : "העלה תמונות חדשות"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length) uploadFiles(files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* Empty state */}
        {groups.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-12 text-center">
            <FaCamera size={28} className="mx-auto mb-2 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">אין תמונות התקדמות עדיין</h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              לחץ "העלה תמונות חדשות" כדי להוסיף את המחזור הראשון.
            </p>
          </div>
        )}

        {/* Groups by date — newest cycle first, always-visible scrollbar.
            max-h shows roughly 2 rows of photos so older cycles are scrollable. */}
        <div
          className="modal-sets-scroll flex flex-col gap-10 pl-2"
          style={{ maxHeight: "min(78vh, 880px)" }}
        >
          {groups.map((group) => (
            <div key={group.cycleNumber}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                <div className="flex items-baseline gap-2 px-4">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    מחזור {group.cycleNumber}
                  </span>
                  {group.uploadDate && (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      · {group.uploadDate}
                    </span>
                  )}
                </div>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                {group.photos.map((p, i) => {
                  const isBusy = !!p.storageKey && busyKey === p.storageKey;
                  if (p.url) {
                    return (
                      <div
                        key={i}
                        className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 transition-all hover:border-blue-300 hover:shadow-md"
                      >
                        <button
                          type="button"
                          onClick={() => openCompareAtAngle(i)}
                          className="absolute inset-0 z-0"
                          aria-label={`פתח השוואה — ${p.label}`}
                        >
                          <img
                            src={p.url}
                            alt={p.label}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>

                        {/* Hover action bar (top-left) */}
                        <div className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReplaceClick(p);
                            }}
                            disabled={isBusy}
                            title="החלף תמונה"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                          >
                            <FaArrowsRotate size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p);
                            }}
                            disabled={isBusy}
                            title="מחק תמונה"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>

                        {/* Busy overlay during delete/replace */}
                        {isBusy && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                            פועל...
                          </div>
                        )}

                        {/* Bottom label */}
                        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center justify-center rounded-lg bg-white/95 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 backdrop-blur-sm">
                          {p.label}
                        </div>
                      </div>
                    );
                  }
                  // Missing slot — per-card upload
                  return (
                    <label
                      key={i}
                      className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 transition-all hover:border-blue-300 hover:shadow-md"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length) uploadFiles(files);
                          e.target.value = "";
                        }}
                      />
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500 transition-colors group-hover:text-blue-500">
                        <FaCamera size={32} />
                        <span className="text-sm font-medium">{p.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison modal */}
      {compareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-sm"
          onClick={() => setCompareOpen(false)}
          dir="rtl"
        >
          <div
            className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col gap-3 rounded-3xl bg-white dark:bg-slate-900 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">זווית:</span>
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  {ANGLE_LABELS.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => setCompareAngle(i)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        compareAngle === i
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  <FaShare size={11} />
                  <span>שתף עם המתאמן</span>
                </button>
                <button
                  onClick={() => setCompareOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100"
                >
                  <FaXmark size={16} />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <ComparePane
                groupIdx={compareRightGroup}
                groupLabel="לפני"
                groups={groups}
                angle={compareAngle}
                onChange={setCompareRightGroup}
                badgeColor="bg-slate-700"
              />
              <ComparePane
                groupIdx={compareLeftGroup}
                groupLabel="אחרי"
                groups={groups}
                angle={compareAngle}
                onChange={setCompareLeftGroup}
                badgeColor="bg-blue-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ComparePane({
  groupIdx,
  groupLabel,
  groups,
  angle,
  onChange,
  badgeColor,
}: {
  groupIdx: number;
  groupLabel: string;
  groups: PhotoGroup[];
  angle: number;
  onChange: (n: number) => void;
  badgeColor: string;
}) {
  const group = groups[groupIdx];
  const photo = group?.photos[angle];
  return (
    <div className="flex min-h-0 flex-col gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full ${badgeColor} px-3 py-1 text-xs font-bold text-white`}
        >
          {groupLabel}
        </span>
        <select
          value={groupIdx}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
        >
          {groups.map((g, i) => (
            <option key={i} value={i}>
              {g.date}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {photo?.url ? (
          <img src={photo.url} alt={photo.label} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <FaCamera size={32} />
            <span className="text-sm">חסרה תמונה</span>
          </div>
        )}
      </div>
    </div>
  );
}
