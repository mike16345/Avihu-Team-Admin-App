export function poundsToKg(pounds:number) {
    const conversionFactor = 0.453592;
    const kilograms = pounds * conversionFactor;
    return kilograms;
  }