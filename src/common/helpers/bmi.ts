const bmiTable = [
  { type: "Súlyos soványság", minBMI: 0, maxBMI: 15.99 },
  { type: "Mérsékelt soványság", minBMI: 16, maxBMI: 16.99 },
  { type: "Enyhe soványság", minBMI: 17, maxBMI: 18.49 },
  { type: "Normális testsúly", minBMI: 18.5, maxBMI: 24.99 },
  { type: "Túlsúly", minBMI: 25, maxBMI: 29.99 },
  { type: "I. fokú elhízás", minBMI: 30, maxBMI: 34.99 },
  { type: "II. fokú elhízás", minBMI: 35, maxBMI: 39.99 },
  { type: "III. fokú elhízás", minBMI: 40, maxBMI: 100 },
];

export default function getBmiCategory(bmi) {
  const category = bmiTable.find(({ minBMI, maxBMI }) => bmi >= minBMI && bmi <= maxBMI);
  return category ? category.type : "Érvénytelen BMI";
}
