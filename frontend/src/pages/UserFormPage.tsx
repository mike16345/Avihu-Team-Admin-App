/**
 * UserFormPage — הוספה / עריכה של מתאמן (עיצוב חדש)
 *
 * שומר על אותו עיצוב כמו דף פרופיל מתאמן:
 *   - כותרת עם אבטאר (ראשי תיבות) + תאריכים
 *   - טופס בעיצוב כרטיסי (Card-style)
 *   - כפתור שמירה כחול בסגנון המערכת
 *
 * חיבור: useAddUser / useUpdateUser הקיימים → POST/PUT /users
 */
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaUser,
  FaArrowRight,
  FaCalendarDays,
  FaCalendarCheck,
  FaChevronDown,
  FaCheck,
  FaXmark,
} from "react-icons/fa6";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import useAddUser from "@/hooks/mutations/User/useAddUser";
import useUpdateUser from "@/hooks/mutations/User/useUpdateUser";
import useDeleteUser from "@/hooks/mutations/User/useDeleteUser";
import { FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import { IUserPost } from "@/interfaces/IUser";
import UserPlanTypes from "@/enums/UserPlanTypes";
import { weightTab } from "./UserDashboard";

const DIETARY_OPTIONS = ["טבעוני", "צמחוני", "ללא גלוטן", "ללא לקטוז", "ללא חלב", "אלרגיה לאגוזים"];

const REMIND_IN_OPTIONS = [
  { value: 604800, label: "שבוע" },
  { value: 1209600, label: "שבועיים" },
  { value: 1814400, label: "שלושה שבועות" },
  { value: 2592000, label: "חודש" },
];

const DATE_PRESETS = [
  { label: "חודש", days: 30 },
  { label: "חודשיים", days: 60 },
  { label: "שלושה חודשים", days: 90 },
  { label: "ארבעה חודשים", days: 120 },
  { label: "חצי שנה", days: 180 },
  { label: "שנה", days: 360 },
];

const getInitials = (firstName: string, lastName: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

const toDateInput = (d?: Date | string) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingUser, isLoading, isError, error } = useUserQuery(id);
  const editUser = useUpdateUser(id || "");
  const addNewUser = useAddUser();
  const deleteUserMutation = useDeleteUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [planType, setPlanType] = useState("");
  const [remindIn, setRemindIn] = useState<number>(604800);
  const [dateFinished, setDateFinished] = useState<string>("");
  const [dietaryType, setDietaryType] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingUser) {
      setFirstName(existingUser.firstName || "");
      setLastName(existingUser.lastName || "");
      setPhone(existingUser.phone || "");
      setEmail(existingUser.email || "");
      setPlanType(existingUser.planType || "");
      setRemindIn(existingUser.remindIn || 604800);
      setDateFinished(toDateInput(existingUser.dateFinished));
      setDietaryType(existingUser.dietaryType || []);
    }
  }, [existingUser]);

  const initials = useMemo(() => getInitials(firstName, lastName), [firstName, lastName]);
  const isPending = editUser.isPending || addNewUser.isPending;

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteUserMutation.mutateAsync(id);
      navigate("/users");
    } catch (e) {
      console.error(e);
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!firstName.trim() || firstName.length < 2) e.firstName = "שם פרטי קצר מדי";
    if (!lastName.trim() || lastName.length < 2) e.lastName = "שם משפחה קצר מדי";
    if (!phone.trim()) e.phone = "חובה למלא טלפון";
    if (!email.trim() || !email.includes("@")) e.email = "אימייל לא תקין";
    if (!planType) e.planType = "בחר סוג תוכנית";
    if (!dateFinished) e.dateFinished = "בחר תאריך סיום";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const user: IUserPost = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      planType,
      remindIn,
      dateFinished: new Date(dateFinished),
      dietaryType,
    };

    try {
      let response: any;
      if (id) {
        await editUser.mutateAsync({ id, user: user as any });
      } else {
        (user as any).checkInAt = Date.now() + user.remindIn;
        response = await addNewUser.mutateAsync(user);
      }
      navigate(`/users/${response?.data?._id || id || ""}?tab=${weightTab}`);
    } catch (err) {
      console.error(err);
    }
  };

  const applyDatePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDateFinished(d.toISOString().split("T")[0]);
  };

  const toggleDietary = (item: string) => {
    setDietaryType((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  if (isLoading) return <Loader size="large" />;
  if (isError && isEdit) return <ErrorPage message={error.message} />;

  return (
    <div
      data-testid="user-form-page"
      dir="rtl"
      className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-4 md:px-12 lg:px-20"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate("/users")}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600"
      >
        <FaArrowRight size={11} />
        <span>חזרה לרשימת המתאמנים</span>
      </button>

      {/* Header — compact */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1 bg-blue-400" />
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-400 text-base font-bold text-white ring-2 ring-white">
            {initials}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              {isEdit ? "עריכת מתאמן" : "מתאמן חדש"}
            </p>
            <h2 className="text-base font-bold leading-tight text-slate-900">
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : "ללא שם"}
            </h2>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="user-form">
        {/* Personal details card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FaUser size={13} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">פרטים אישיים</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="שם פרטי" error={errors.firstName} required>
              <input
                data-testid="user-form-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="שם פרטי..."
                className={inputCls(!!errors.firstName)}
              />
            </Field>
            <Field label="שם משפחה" error={errors.lastName} required>
              <input
                data-testid="user-form-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="שם משפחה..."
                className={inputCls(!!errors.lastName)}
              />
            </Field>
            <Field label="טלפון" error={errors.phone} required>
              <input
                data-testid="user-form-phone"
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0501234567"
                className={inputCls(!!errors.phone) + " text-center"}
              />
            </Field>
            <Field label="אימייל" error={errors.email} required>
              <input
                data-testid="user-form-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="israel@example.com"
                className={inputCls(!!errors.email) + " text-center"}
              />
            </Field>
          </div>
        </div>

        {/* Plan card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FaCalendarDays size={13} className="text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">תוכנית וליווי</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="סוג תוכנית" error={errors.planType} required>
              <SelectInput
                value={planType}
                onChange={setPlanType}
                placeholder="בחר סוג תוכנית"
                error={!!errors.planType}
                testId="user-form-plan-type"
                options={[
                  { value: UserPlanTypes.CUT, label: UserPlanTypes.CUT },
                  { value: UserPlanTypes.BULK, label: UserPlanTypes.BULK },
                ]}
              />
            </Field>
            <Field label="בדיקה תקופתית">
              <SelectInput
                value={String(remindIn)}
                onChange={(v) => setRemindIn(Number(v))}
                placeholder="כל כמה זמן..."
                testId="user-form-remind-in"
                options={REMIND_IN_OPTIONS.map((r) => ({ value: String(r.value), label: r.label }))}
              />
            </Field>
            <Field label="תאריך סיום הליווי" error={errors.dateFinished} required>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <FaCalendarCheck
                    size={12}
                    className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    data-testid="user-form-date-finished"
                    type="date"
                    value={dateFinished}
                    onChange={(e) => setDateFinished(e.target.value)}
                    className={inputCls(!!errors.dateFinished) + " ps-9"}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {DATE_PRESETS.map((p) => (
                    <button
                      key={p.days}
                      type="button"
                      onClick={() => applyDatePreset(p.days)}
                      data-testid="user-form-date-preset"
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </Field>
          </div>
        </div>

        {/* Dietary restrictions card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FaCheck size={13} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">הגבלות תזונה</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => {
              const selected = dietaryType.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleDietary(opt)}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-semibold transition-all ${
                    selected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {selected ? <FaCheck size={10} /> : <FaXmark size={10} className="opacity-30" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action bar */}
        <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-2 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm">
          {/* Delete (only in edit mode) */}
          {isEdit ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteUserMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaTrash size={11} />
              <span>מחיקת מתאמן</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              ביטול
            </button>
            <button
              data-testid="user-form-submit"
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "שומר..." : isEdit ? "שמירת שינויים" : "הוספת מתאמן"}
            </button>
          </div>
        </div>
      </form>

      {/* Delete confirmation popup */}
      {showDeleteConfirm && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !deleteUserMutation.isPending && setShowDeleteConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center gap-2 text-red-600">
              <FaTriangleExclamation size={20} />
              <h3 className="text-lg font-bold">מחיקת מתאמן</h3>
            </div>
            <p className="mb-3 text-sm text-slate-700">
              אתה עומד למחוק את{" "}
              <span className="font-bold text-slate-900">
                {firstName} {lastName}
              </span>
              .
            </p>
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <p className="font-semibold">⚠️ פעולה זו אינה הפיכה:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                <li>כל הנתונים של המתאמן יימחקו</li>
                <li>שקילות, מדידות, תוכניות אימון ותפריט יימחקו</li>
                <li>תמונות התקדמות יימחקו</li>
                <li>המתאמן לא יוכל יותר להתחבר לאפליקציה</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteUserMutation.isPending}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteUserMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaTrash size={11} />
                {deleteUserMutation.isPending ? "מוחק..." : "כן, מחק לצמיתות"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========== Helpers ===========

function inputCls(hasError: boolean): string {
  return `w-full rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
      : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
  }`;
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ms-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <span data-testid={`error-${label}`} className="mt-0.5 text-xs font-semibold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  error,
  testId,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
  testId?: string;
}) {
  return (
    <div className="relative">
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls(!!error)} cursor-pointer appearance-none pe-9`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FaChevronDown
        size={10}
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

export default UserFormPage;
