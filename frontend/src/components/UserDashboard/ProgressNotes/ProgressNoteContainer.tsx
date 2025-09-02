import { IProgressNote } from "@/interfaces/IProgress";
import Note from "./Note";
import AddButton from "@/components/ui/buttons/AddButton";
import ProgressNoteForm from "./ProgressNoteForm";
import useProgressNoteQuery from "@/hooks/queries/progressNote/useProgressNoteQuery";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export const mockProgressNotes: IProgressNote[] = [
  {
    _id: "1",
    date: new Date("2025-08-20"),
    trainer: "יוסי לוי",
    diet: 75,
    workouts: 100,
    cardio: 50,
    content: "שמירה טובה על התפריט, התאמן חזק במיוחד השבוע.",
  },
  {
    _id: "2",
    date: new Date("2025-08-25"),
    trainer: "דנה כהן",
    diet: 50,
    workouts: 75,
    cardio: 25,
    content: "היו חריגות קטנות בתזונה, אך באימונים ניכר שיפור.",
  },
  {
    _id: "3",
    date: new Date("2025-08-28"),
    trainer: "אורי ברק",
    diet: 100,
    workouts: 100,
    cardio: 75,
    content: "מתמיד בצורה מרשימה, ירידה ניכרת במשקל ושיפור בכושר.",
  },
  {
    _id: "3",
    date: new Date("2025-10-15"),
    trainer: "אורי ברק",
    diet: 100,
    workouts: 100,
    content: "מתמיד בצורה מרשימה, ירידה ניכרת במשקל ושיפור בכושר.",
  },
  {
    _id: "10",
    date: new Date("2025-08-31"),
    trainer: "אורי ברק",
    content: "מתמיד בצורה מרשימה, ירידה ניכרת במשקל ושיפור בכושר.",
  },
  {
    _id: "7",
    date: new Date("2025-9-28"),
    trainer: "אורי ברק",
    workouts: 100,
    cardio: 75,
    content: "מתמיד בצורה מרשימה, ירידה ניכרת במשקל ושיפור בכושר.",
  },
  {
    _id: "12",
    date: new Date("2025-08-28"),
    trainer: "אורי ברק",
    workouts: 100,
    content: "מתמיד בצורה מרשימה, ירידה ניכרת במשקל ושיפור בכושר.",
  },
  {
    _id: "4",
    date: new Date("2025-08-30"),
    trainer: "נעמה פרידמן",
    diet: 75,
    workouts: 50,
    cardio: 100,
    content: "ביצע ריצות ארוכות, באימוני כוח צריך עוד חיזוק.",
  },
  {
    _id: "5",
    date: new Date("2025-09-01"),
    trainer: "גלעד רוזן",
    diet: 25,
    workouts: 75,
    cardio: 50,
    content: "נדרש לשפר את המשמעת בתזונה, אך כוחו עלה משמעותית.",
  },
];

const ProgressNoteContainer = () => {
  const { id } = useParams();
  const { data, isError, isLoading, error } = useProgressNoteQuery(id);

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  return (
    <>
      <div className="max-h-[55vh] overflow-y-auto space-y-5 p-2" dir="rtl">
        {data?.data &&
          data.data.progressNotes.map((note, i) => <Note key={i} progressNote={note} />)}
      </div>

      <AddButton onClick={() => {}} tip="הוסף פתק" />

      <ProgressNoteForm />
    </>
  );
};

export default ProgressNoteContainer;
