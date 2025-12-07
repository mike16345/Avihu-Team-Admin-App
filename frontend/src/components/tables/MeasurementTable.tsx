import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "react-router-dom";
import useMeasurementQuery from "@/hooks/queries/measurements/useMeasurementQuery";
import moment from "moment-timezone";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

const MeasurementTable = () => {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useMeasurementQuery(id);

  const measurements = useMemo(() => {
    if (!data) return [];

    return data.measurements.map(({ date, _id, ...measurements }) => {
      const starterObj = {
        chest: undefined,
        arm: undefined,
        waist: undefined,
        glutes: undefined,
        thigh: undefined,
        calf: undefined,
      };

      const updatedObj = Object.fromEntries(
        Object.keys(starterObj).map((key) => [key, measurements[key] ?? starterObj[key]])
      );

      return { date: moment(date).format("DD/MM/YYYY"), ...updatedObj };
    });
  }, [data]);

  if (isLoading) return <Loader size="large" />;
  if (isError && error.status !== 404) return <ErrorPage />;
  if (measurements.length == 0) return <h1 className="p-5 text-center ">לא נמצאו נתוני היקפים</h1>;

  return (
    <div className="rounded-md border  max-h-[65vh] overflow-auto">
      <Table dir="rtl">
        <TableHeader dir="rtl">
          <TableRow dir="rtl">
            <TableHead className="text-right">תאריך</TableHead>
            <TableHead className="text-right">חזה</TableHead>
            <TableHead className="text-right">זרוע</TableHead>
            <TableHead className="text-right">מותן</TableHead>
            <TableHead className="text-right">ישבן</TableHead>
            <TableHead className="text-right">ירך</TableHead>
            <TableHead className="text-right">תאומים</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {measurements.map((row, i) => (
            <TableRow key={row.date + i}>
              {Object.values(row).map((muscle, i) => (
                <TableCell key={muscle + i}>{muscle}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MeasurementTable;
