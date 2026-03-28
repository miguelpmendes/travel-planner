import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ItemType } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  ATTRACTION: "Atração",
  RESTAURANT: "Restaurante",
  ACTIVITY: "Atividade",
  TRANSPORT: "Transporte",
  ACCOMMODATION: "Alojamento",
  OTHER: "Outro",
};

export const ITEM_TYPE_COLORS: Record<ItemType, string> = {
  ATTRACTION: "bg-blue-100 text-blue-800 border-blue-200",
  RESTAURANT: "bg-orange-100 text-orange-800 border-orange-200",
  ACTIVITY: "bg-green-100 text-green-800 border-green-200",
  TRANSPORT: "bg-purple-100 text-purple-800 border-purple-200",
  ACCOMMODATION: "bg-yellow-100 text-yellow-800 border-yellow-200",
  OTHER: "bg-gray-100 text-gray-800 border-gray-200",
};

export const PERIOD_OPTIONS = {
  default: ["Manhã", "Tarde"] as const,
  restaurant: ["Almoço", "Jantar"] as const,
};

export function getPeriodsForType(type: ItemType): readonly string[] {
  return type === "RESTAURANT" ? PERIOD_OPTIONS.restaurant : PERIOD_OPTIONS.default;
}

export const PERIOD_ICONS: Record<string, string> = {
  Manhã: "🌅",
  Tarde: "☀️",
  Almoço: "🍴",
  Jantar: "🌙",
};

export const ITEM_TYPE_ICONS: Record<ItemType, string> = {
  ATTRACTION: "🏛️",
  RESTAURANT: "🍽️",
  ACTIVITY: "🎯",
  TRANSPORT: "🚌",
  ACCOMMODATION: "🏨",
  OTHER: "📌",
};
