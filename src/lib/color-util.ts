
const cardVariants = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-orange-100 text-slate-800",
];

export const getCardVariant = (index: number) => cardVariants[index % cardVariants.length];