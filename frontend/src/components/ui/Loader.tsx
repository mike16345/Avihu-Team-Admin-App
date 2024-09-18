import React from "react";
interface LoaderProps {
  size?: `xs` | `small` | `medium` | `large` | `xl`;
}

const Loader: React.FC<LoaderProps> = ({ size = `medium` }) => {
  const pxSize =
    size === `xs` ? 6 : size === `small` ? 12 : size === `medium` ? 16 : size === `large` ? 20 : 24;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col gap-5 items-center">
        <div
          className={`rounded-full ${
            size === `xs` ? `border-4` : `border-8`
          } border-t-primary animate-spin w-${pxSize} h-${pxSize}`}
        ></div>
      </div>
    </div>
  );
};

export default Loader;
