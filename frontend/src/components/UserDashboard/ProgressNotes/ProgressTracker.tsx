import React from "react";

interface ProgressTrackerProps {
  label: string;
  value: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ label, value }) => {
  return (
    <div>
      <span className="text-xs">{label}</span>
      <div className="text-sm">{value}%</div>
    </div>
  );
};

export default ProgressTracker;
