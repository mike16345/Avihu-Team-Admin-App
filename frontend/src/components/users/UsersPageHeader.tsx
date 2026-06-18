import { FaPlus } from "react-icons/fa6";

type UsersPageHeaderProps = {
  onAddUser: () => void;
};

const UsersPageHeader = ({ onAddUser }: UsersPageHeaderProps) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">מתאמנים</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          ניהול ומעקב אחרי כל המתאמנים שלך
        </p>
      </div>
      <button
        data-testid="users-add-button"
        onClick={onAddUser}
        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
      >
        <FaPlus size={11} />
        <span>מתאמן חדש</span>
      </button>
    </div>
  );
};

export default UsersPageHeader;
