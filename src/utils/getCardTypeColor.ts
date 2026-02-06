import { type CardType } from "~/lib/db";

export function getCardTypeColor(cardType: CardType) {
  switch (cardType) {
    case "Medicover":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900";
    case "Medicover Light":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900";
    case "Multisport":
      return "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900";
    case "Classic":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900";
    case "No card":
      return "bg-orange-100 text-slate-800 hover:bg-orange-200 hover:text-orange-900";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900";
  }
}
