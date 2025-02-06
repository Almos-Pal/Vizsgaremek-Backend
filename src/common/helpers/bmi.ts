const bmiTable = [
    { type: "sovány", minBMI: 0, maxBMI: 18.4 },
    { type: "normál", minBMI: 18.5, maxBMI: 24.9 },
    { type: "túlsúlyos", minBMI: 25, maxBMI: 29.9 },
    { type: "elhízott", minBMI: 30, maxBMI: 100 },
  ];
  
  export default function getBmiCategory(bmi) {
    const category = bmiTable.find(({ minBMI, maxBMI }) => bmi >= minBMI && bmi <= maxBMI);
    return category ? category.type : "Érvénytelen BMI";
  }