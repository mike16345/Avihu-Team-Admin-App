export function poundsToKg(pounds: number) {
  const conversionFactor = 0.453592;
  const kilograms = pounds * conversionFactor;
  return kilograms;
}

export const removeItemAtIndex = <T>(index: number, array: T[]): T[] => {
  return array.filter((_, i) => i !== index);
};

export const duplicateItem = (index: number, array: any[]) => {
  const duplicatedItem = array[index];
  const newArray = [...array];

  newArray.push(duplicatedItem);

  return newArray;
};
