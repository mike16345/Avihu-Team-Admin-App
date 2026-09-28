/**
 * BackLink — text-link back navigation for inner pages.
 *
 * Sits at the very top of any "child" page (preset editor, form
 * builder, user dashboard, …) and walks the trainer one step back
 * in the navigation stack. Falls back to `to` when there's no
 * browser-history entry to pop (e.g. opening the page directly).
 *
 * Visual style mirrors the existing UserDashboard back link so every
 * inner page reads as part of the same family.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";

interface BackLinkProps {
  /** Fallback route when there's no history entry to pop. Optional —
   *  defaults to home ("/"), which is the safest landing spot when
   *  the user arrived directly via URL. */
  to?: string;
  /** Override the default "חזרה" label. */
  label?: string;
}

const BackLink: React.FC<BackLinkProps> = ({ to = "/", label = "חזרה" }) => {
  const navigate = useNavigate();
  const canGoBack =
    typeof window !== "undefined" &&
    typeof window.history !== "undefined" &&
    typeof window.history.state?.idx === "number" &&
    window.history.state.idx > 0;

  const handleClick = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }
    navigate(to);
  };

  return (
    <button
      type="button"
      data-testid="back-link"
      onClick={handleClick}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
    >
      <FaArrowRight size={11} />
      <span>{label}</span>
    </button>
  );
};

export default BackLink;
