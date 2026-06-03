/**
 * useMeasurementApi — adapter over the per-muscle server contract.
 *
 * Server contract (POST /measurements):
 *   body: { userId, date, muscle, measurement }
 *   The server upserts: if a row for that (userId, date) exists, it sets
 *   `measurements.$.<muscle>`. Otherwise it pushes a new row. So we fan-out
 *   one POST per muscle that has a numeric value.
 *
 * DELETE /measurements:
 *   body: { userId, date, muscle }  — removes one muscle column for that date
 */
import { deleteItem, fetchData, sendData } from "@/API/api";
import { IMuscleMeasurement, IUserMuscleMeasurements } from "@/interfaces/measurements";
import { ApiResponse } from "@/types/types";

const MEASUREMENT_ENDPOINT = "measurements";

const MUSCLE_KEYS = ["chest", "arm", "waist", "glutes", "thigh", "calf"] as const;

export const useMeasurementApi = () => {
  const getMeasurements = (userId: string) =>
    fetchData<ApiResponse<IUserMuscleMeasurements>>(MEASUREMENT_ENDPOINT + "/one", {
      userId,
    }).then((res) => res.data);

  /** Save a full row by fanning out one POST per muscle that has a value. */
  const saveMeasurementRow = async (userId: string, measurement: IMuscleMeasurement) => {
    const date = measurement.date as unknown as string; // already ISO-formatted by the caller
    let lastRes: any = null;
    for (const muscle of MUSCLE_KEYS) {
      const raw = (measurement as any)[muscle];
      if (raw === undefined || raw === null) continue;
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      // Note: we still POST zeros (the server treats 0 as a measured value).
      lastRes = await sendData<ApiResponse<IUserMuscleMeasurements>>(MEASUREMENT_ENDPOINT, {
        userId,
        date,
        muscle,
        measurement: value,
      });
    }
    return lastRes;
  };

  /** Both add + update use the same upsert endpoint per-muscle. */
  const addMeasurement = (userId: string, measurement: IMuscleMeasurement) =>
    saveMeasurementRow(userId, measurement);
  const updateMeasurement = (userId: string, measurement: IMuscleMeasurement) =>
    saveMeasurementRow(userId, measurement);

  /** Delete every muscle value for a given date (full-row delete). */
  const deleteMeasurement = async (userId: string, date: string) => {
    let lastRes: any = null;
    for (const muscle of MUSCLE_KEYS) {
      try {
        lastRes = await deleteItem<ApiResponse<any>>(MEASUREMENT_ENDPOINT, undefined, undefined, {
          userId,
          date,
          muscle,
        });
      } catch (e: any) {
        // 404 = that muscle wasn't set for this row; safe to ignore
        if (e?.status !== 404) throw e;
      }
    }
    return lastRes;
  };

  return { getMeasurements, addMeasurement, updateMeasurement, deleteMeasurement };
};
