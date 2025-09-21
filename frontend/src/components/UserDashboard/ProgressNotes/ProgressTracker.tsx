import React from "react";

interface ProgressTrackerProps {
  label: string;
  value: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ label, value }) => {
  return (
    <div className="flex gap-1 items-center">
      <span className="text-xs block">{label} - </span>
      <div className="text-sm font-bold">{value}%</div>
    </div>
  );
};

export default ProgressTracker;
