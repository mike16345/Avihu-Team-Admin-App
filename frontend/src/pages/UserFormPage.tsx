import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserForm, { type UserFormErrors, type UserFormValues } from "@/components/forms/UserForm";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import useAddUser from "@/hooks/mutations/User/useAddUser";
import useUpdateUser from "@/hooks/mutations/User/useUpdateUser";
import useDeleteUser from "@/hooks/mutations/User/useDeleteUser";
import type { IUser, IUserPost } from "@/interfaces/IUser";
import { weightTab } from "./UserDashboard";
import { isValidEmail } from "@/utils/utils";

const DEFAULT_REMIND_IN = 604800;

type UserFormPayload = IUserPost & { checkInAt?: number; subTrainerId?: string };

type AddUserResponse = {
  data?: {
    _id?: string;
  };
};

const getInitials = (firstName: string, lastName: string) => {
  const firstInitial = firstName?.[0] || "";
  const lastInitial = lastName?.[0] || "";

  return (firstInitial + lastInitial).toUpperCase() || "?";
};

const toDateInput = (dateValue?: Date | string) => {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0];
};

const buildUserPayload = (values: UserFormValues): UserFormPayload => ({
  firstName: values.firstName.trim(),
  lastName: values.lastName.trim(),
  phone: values.phone.trim(),
  email: values.email.trim().toLowerCase(),
  planType: values.planType,
  remindIn: values.remindIn,
  dateFinished: new Date(values.dateFinished),
  dietaryType: values.dietaryType,
  ...(values.subTrainerId ? { subTrainerId: values.subTrainerId } : {}),
});

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: existingUser, isLoading, isError, error } = useUserQuery(id);
  const editUser = useUpdateUser(id || "");
  const addNewUser = useAddUser();
  const deleteUserMutation = useDeleteUser();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [values, setValues] = useState<UserFormValues>({
    dateFinished: "",
    dietaryType: [],
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    planType: "",
    remindIn: DEFAULT_REMIND_IN,
    subTrainerId: "",
  });
  const [errors, setErrors] = useState<UserFormErrors>({});

  useEffect(() => {
    if (!existingUser) return;

    setValues({
      dateFinished: toDateInput(existingUser.dateFinished),
      dietaryType: existingUser.dietaryType || [],
      email: existingUser.email || "",
      firstName: existingUser.firstName || "",
      lastName: existingUser.lastName || "",
      phone: existingUser.phone || "",
      planType: existingUser.planType || "",
      remindIn: existingUser.remindIn || DEFAULT_REMIND_IN,
      subTrainerId: (existingUser as { subTrainerId?: string }).subTrainerId || "",
    });
  }, [existingUser]);

  const initials = useMemo(
    () => getInitials(values.firstName, values.lastName),
    [values.firstName, values.lastName]
  );
  const isPending = editUser.isPending || addNewUser.isPending;

  const updateValue = <Key extends keyof UserFormValues>(key: Key, value: UserFormValues[Key]) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: UserFormErrors = {};

    if (!values.firstName.trim() || values.firstName.length < 2) {
      nextErrors.firstName = "שם פרטי קצר מדי";
    }

    if (!values.lastName.trim() || values.lastName.length < 2) {
      nextErrors.lastName = "שם משפחה קצר מדי";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "חובה למלא טלפון";
    }

    if (!isValidEmail(values.email)) {
      nextErrors.email = "אימייל לא תקין";
    }

    if (!values.planType) {
      nextErrors.planType = "בחר סוג תוכנית";
    }

    if (!values.dateFinished) {
      nextErrors.dateFinished = "בחר תאריך סיום";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleBack = () => {
    if (isEdit) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteUserMutation.mutateAsync(id);
      navigate("/users");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (!validate()) return;

    const user = buildUserPayload(values);

    try {
      let createdUserId: string | undefined;

      if (id) {
        await editUser.mutateAsync({ id, user: user as unknown as IUser });
      } else {
        user.checkInAt = Date.now() + user.remindIn;
        const response = (await addNewUser.mutateAsync(user)) as AddUserResponse;
        createdUserId = response?.data?._id;
      }

      navigate(`/users/${createdUserId || id || ""}?tab=${weightTab}`);
    } catch (err) {
      console.error(err);
    }
  };

  const applyDatePreset = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    updateValue("dateFinished", date.toISOString().split("T")[0]);
  };

  const toggleDietary = (item: string) => {
    updateValue(
      "dietaryType",
      values.dietaryType.includes(item)
        ? values.dietaryType.filter((dietaryItem) => dietaryItem !== item)
        : [...values.dietaryType, item]
    );
  };

  if (isLoading) return <Loader size="large" />;

  if (isError && isEdit) return <ErrorPage message={error.message} />;

  return (
    <UserForm
      errors={errors}
      initials={initials}
      isDeletePending={deleteUserMutation.isPending}
      isEdit={isEdit}
      isPending={isPending}
      showDeleteConfirm={showDeleteConfirm}
      values={values}
      onApplyDatePreset={applyDatePreset}
      onBack={handleBack}
      onCancel={handleBack}
      onChange={updateValue}
      onDelete={handleDelete}
      onDietaryToggle={toggleDietary}
      onShowDeleteConfirmChange={setShowDeleteConfirm}
      onSubmit={handleSubmit}
    />
  );
};

export default UserFormPage;
