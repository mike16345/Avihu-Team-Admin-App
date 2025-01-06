import { useEffect, useState } from "react";

export const useFadeAnimation = (
  isVisible: boolean,
  direction: "Right" | "Left" | "Up" | "Down",
  axis = "enter",
  duration = "0.5s",
  axisDirection: "positive" | "negative" = "positive"
) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    let animation = "";
    let translateValue = 10; // Default translate value
    let translateDirection = direction == "Right" || direction == "Left" ? "X" : "Y"; // Default translate value

    if (axis === "enter") {
      animation = isVisible ? `fadeIn${direction}` : `fadeOut${direction}`;
      translateValue = isVisible ? 0 : 10; // Adjust translate value based on visibility
    } else if (axis === "exit") {
      animation = isVisible ? `fadeOut${direction}` : `fadeIn${direction}`;
      translateValue = isVisible ? 10 : 0; // Adjust translate value based on visibility
    }

    translateValue = axisDirection == "negative" ? translateValue * -1 : translateValue;

    setStyle({
      animation: `${animation} ${duration} forwards`,
      transform: `translate${translateDirection}(${translateValue}px)`,
    });
  }, [isVisible, direction, axis, duration]);

  return style;
};
