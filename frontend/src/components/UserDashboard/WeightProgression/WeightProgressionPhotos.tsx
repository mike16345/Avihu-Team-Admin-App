import { FC, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FaCamera, FaXmark, FaShare, FaArrowsRotate, FaTrash } from "react-icons/fa6";
import { FaUpload } from "react-icons/fa";

import { deleteItem, sendData } from "@/API/api";
import DeleteModal from "@/components/Alerts/DeleteModal";
import CustomSelect from "@/components/ui/CustomSelect";
import Loader from "@/components/ui/Loader";
import { determineServerUrl } from "@/config/apiConfig";
import useUserWeighInPhotosQuery from "@/hooks/queries/weighInPhotos/useUserWeighInPhotosQuery";
import { ApiResponse } from "@/types/types";

export type Photo = { url?: string; _id?: string; date?: string };

const ANGLE_LABELS = ["מלפנים", "מאחור", "מהצד ימין", "מהצד שמאל"];
const HIDDEN_KEYS_STORAGE = "avihu_hidden_photo_keys";

type PhotoSlot = { label: string; url?: string; storageKey?: string };
type PhotoGroup = {
  cycleNumber: number;
  uploadDate?: string;
  photos: PhotoSlot[];
};

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
    /* localStorage unavailable */
  }
}

function extractUploadDate(storageKey?: string): string | undefined {
  if (!storageKey) return undefined;
  const parts = storageKey.split("/");
  const datePart = parts.length >= 3 ? parts[parts.length - 2] : undefined;
  if (!datePart) return undefined;
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return datePart;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function extractStorageKey(fullUrl?: string): string | undefined {
  if (!fullUrl) return undefined;
  const marker = "/images/";
  const index = fullUrl.indexOf(marker);
  if (index < 0) return fullUrl;
  return fullUrl.slice(index + marker.length);
}

function groupPhotos(photos: string[]): PhotoGroup[] {
  if (!photos?.length) return [];

  const groups: PhotoGroup[] = [];
  for (let index = 0; index < photos.length; index += 4) {
    const batch = photos.slice(index, index + 4);
    const cycleNumber = Math.floor(index / 4) + 1;
    const slots: PhotoSlot[] = ANGLE_LABELS.map((label, slotIndex) => ({
      label,
      url: batch[slotIndex],
      storageKey: extractStorageKey(batch[slotIndex]),
    }));

    groups.push({
      cycleNumber,
      uploadDate: slots.map((slot) => extractUploadDate(slot.storageKey)).find(Boolean),
      photos: slots,
    });
  }

  return groups.reverse();
}

export const WeightProgressionPhotos: FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: photos = [], isLoading } = useUserWeighInPhotosQuery(id);

  const [compareOpen, setCompareOpen] = useState(false);
  const [compareAngle, setCompareAngle] = useState(0);
  const [compareLeftGroup, setCompareLeftGroup] = useState(0);
  const [compareRightGroup, setCompareRightGroup] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [pendingDeleteSlot, setPendingDeleteSlot] = useState<PhotoSlot | null>(null);

  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const pendingReplaceKeyRef = useRef<string | null>(null);

  const visiblePhotos = useMemo(() => {
    if (!id) return photos as string[];
    const hidden = readHiddenKeys(id);
    if (hidden.size === 0) return photos as string[];

    return (photos as string[]).filter((url) => {
      const key = extractStorageKey(url);
      return !key || !hidden.has(key);
    });
  }, [photos, id]);

  const groups = useMemo(() => groupPhotos(visiblePhotos), [visiblePhotos]);

  const openCompareAtAngle = (angleIndex: number) => {
    if (groups.length < 2) return;
    setCompareAngle(angleIndex);
    setCompareLeftGroup(0);
    setCompareRightGroup(groups.length - 1);
    setCompareOpen(true);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [id + "-photos"] });
  };

  const uploadFiles = async (files: FileList): Promise<number> => {
    if (!id || !files.length) return 0;

    const fileArr = Array.from(files);
    const total = fileArr.length;
    const today = new Date().toISOString().split("T")[0];
    const apiBase = determineServerUrl();
    let uploaded = 0;
    let lastError: string | null = null;
    let authExpired = false;

    setUploading(true);

    for (let index = 0; index < total; index += 1) {
      const file = fileArr[index];
      const imageName = `progress-${Date.now()}-${index}`;
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
          uploaded += 1;
        } catch (error: any) {
          const status = error?.status || error?.response?.status;
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
    const photosWord = (count: number) => (count === 1 ? "תמונה אחת" : `${count} תמונות`);

    if (uploaded > 0) {
      refresh();
      if (failed === 0) {
        toast.success(uploaded === 1 ? "התמונה הועלתה בהצלחה!" : `${uploaded} תמונות הועלו בהצלחה!`);
      } else {
        toast.warning(
          `הועלו ${photosWord(uploaded)} · נכשלו ${photosWord(failed)}${lastError ? ` — ${lastError}` : ""}`
        );
      }
    } else if (authExpired) {
      toast.error("ההתחברות פגה — התנתק והתחבר מחדש כדי להעלות תמונות");
    } else if (total === 1) {
      toast.error(lastError || "ההעלאה נכשלה");
    } else {
      toast.error(`כל ההעלאות נכשלו (${total} תמונות)${lastError ? ` — ${lastError}` : ""}`);
    }

    return uploaded;
  };

  const deletePhoto = async (storageKey: string) => {
    if (!id || !storageKey) return false;

    const s3Key = `images/${storageKey}`;
    try {
      await deleteItem<ApiResponse<string>>("s3/photos/one", undefined, undefined, {
        photoId: s3Key,
        userId: id,
      });
      addHiddenKey(id, storageKey);
      return true;
    } catch (error: any) {
      const status = error?.status || error?.response?.status;
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

  const handleDelete = (slot: PhotoSlot) => {
    if (!slot.storageKey) return;
    setPendingDeleteSlot(slot);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteSlot?.storageKey) return;

    const storageKey = pendingDeleteSlot.storageKey;
    setPendingDeleteSlot(null);
    setBusyKey(storageKey);
    const success = await deletePhoto(storageKey);
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
    <div dir="rtl" className="font-heebo">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          handleReplaceFileChosen(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FaCamera size={16} className="text-blue-600" />
            <span className="text-lg font-bold">תמונות התקדמות</span>
          </div>

          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition-all ${
              uploading ? "cursor-not-allowed bg-slate-400" : "bg-slate-900 hover:bg-slate-800 hover:shadow-lg"
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
              onChange={(event) => {
                const files = event.target.files;
                if (files && files.length) uploadFiles(files);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        {groups.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center dark:border-slate-800 dark:bg-slate-800">
            <FaCamera size={28} className="mx-auto mb-2 text-slate-300" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
              אין תמונות התקדמות עדיין
            </h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              לחץ "העלה תמונות חדשות" כדי להוסיף את המחזור הראשון.
            </p>
          </div>
        )}

        <div className="modal-sets-scroll flex max-h-[min(78vh,880px)] flex-col gap-10 pl-2">
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

              <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 sm:grid-cols-4">
                {group.photos.map((photo, angleIndex) => {
                  const isBusy = !!photo.storageKey && busyKey === photo.storageKey;

                  if (photo.url) {
                    return (
                      <div
                        key={angleIndex}
                        className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
                      >
                        <button
                          type="button"
                          onClick={() => openCompareAtAngle(angleIndex)}
                          className="absolute inset-0 z-0"
                          aria-label={`פתח השוואה — ${photo.label}`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>

                        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-100 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleReplaceClick(photo);
                            }}
                            disabled={isBusy}
                            title="החלף תמונה"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-sm transition-all hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:text-slate-200"
                          >
                            <FaArrowsRotate size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(photo);
                            }}
                            disabled={isBusy}
                            title="מחק תמונה"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>

                        {isBusy && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 text-xs font-semibold text-slate-700 backdrop-blur-sm dark:text-slate-200">
                            פועל...
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center justify-center rounded-lg bg-white/95 py-1.5 text-xs font-semibold text-slate-700 backdrop-blur-sm dark:text-slate-200">
                          {photo.label}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <label
                      key={angleIndex}
                      className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={(event) => {
                          const files = event.target.files;
                          if (files && files.length) uploadFiles(files);
                          event.target.value = "";
                        }}
                      />
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500">
                        <FaCamera size={32} />
                        <span className="text-sm font-medium">{photo.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {compareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-sm"
          onClick={() => setCompareOpen(false)}
          dir="rtl"
        >
          <div
            className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col gap-3 rounded-3xl bg-white p-4 font-heebo shadow-2xl dark:bg-slate-900 sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  זווית:
                </span>
                <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  {ANGLE_LABELS.map((label, index) => (
                    <button
                      key={label}
                      onClick={() => setCompareAngle(index)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        compareAngle === index
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
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
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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

      <DeleteModal
        isModalOpen={!!pendingDeleteSlot}
        setIsModalOpen={(open) => {
          if (!open) setPendingDeleteSlot(null);
        }}
        onCancel={() => setPendingDeleteSlot(null)}
        onConfirm={confirmDelete}
        title={pendingDeleteSlot ? `למחוק את התמונה "${pendingDeleteSlot.label}"?` : "למחוק תמונה?"}
        alertMessage={
          <>
            התמונה תוסר מגלריית ההתקדמות של המתאמן.
            <br />
            לא ניתן לשחזר את הפעולה הזו.
          </>
        }
      />
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
  onChange: (index: number) => void;
  badgeColor: string;
}) {
  const group = groups[groupIdx];
  const photo = group?.photos[angle];
  const groupOptions = groups.map((entry, index) => ({
    name: entry.uploadDate ? `מחזור ${entry.cycleNumber} · ${entry.uploadDate}` : `מחזור ${entry.cycleNumber}`,
    value: String(index),
  }));

  return (
    <div className="flex min-h-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/30 p-3 dark:border-slate-800">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={`inline-flex items-center rounded-full ${badgeColor} px-3 py-1 text-xs font-bold text-white`}
        >
          {groupLabel}
        </span>
        <div className="w-full sm:w-[220px]">
          <CustomSelect
            items={groupOptions}
            selectedValue={String(groupIdx)}
            onValueChange={(value) => onChange(Number(value))}
            className="h-9 rounded-lg border-slate-200 bg-white text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
