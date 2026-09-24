import { expect, test } from "@playwright/test";
import {
  changeStepsCardioMode,
  defaultStepsCardioOption,
} from "../../src/constants/cardioOptions";

test("the default uniform steps payload omits per-day targets", () => {
  expect(defaultStepsCardioOption).toEqual({
    mode: "uniform",
    daily: 10000,
  });
});

test("switching a custom steps plan to uniform removes per-day targets", () => {
  expect(
    changeStepsCardioMode(
      {
        mode: "custom",
        daily: 8000,
        perDay: [8000, 8000, 8000, 8000, 8000, 8000, 0],
        tips: "Take Sunday off",
      },
      "uniform"
    )
  ).toEqual({
    mode: "uniform",
    daily: 8000,
    tips: "Take Sunday off",
  });
});

test("switching a uniform steps plan to custom creates seven editable targets", () => {
  expect(changeStepsCardioMode({ mode: "uniform", daily: 8000 }, "custom")).toEqual({
    mode: "custom",
    daily: 8000,
    perDay: [8000, 8000, 8000, 8000, 8000, 8000, 0],
  });
});
