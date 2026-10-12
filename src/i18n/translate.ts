import { format as formatFns } from "date-fns";
import { enGB, pl as plLocale } from "date-fns/locale";
import { en, type MessageKey, type Messages, type PluralMessage } from "./messages/en";
import { pl } from "./messages/pl";

export type Locale = "en" | "pl";
export const LOCALE_STORAGE_KEY = "locale";
const DICTS: Record<Locale, Messages> = { en, pl };

export function translate(
  locale: Locale,
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  const msg = DICTS[locale][key] ?? en[key];
  let text: string;
  if (typeof msg === "string") {
    text = msg;
  } else {
    const p = msg as PluralMessage;
    const count = Number(params.count ?? 0);
    const form = new Intl.PluralRules(locale).select(count) as keyof PluralMessage;
    text = p[form] ?? p.other;
  }
  return text.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`,
  );
}

export function detectLocale(stored: string | null, navigatorLanguage: string | undefined): Locale {
  if (stored === "en" || stored === "pl") return stored;
  return navigatorLanguage?.toLowerCase().startsWith("pl") ? "pl" : "en";
}

export function formatDate(date: Date | string, pattern: string, locale: Locale): string {
  return formatFns(typeof date === "string" ? new Date(date) : date, pattern, {
    locale: locale === "pl" ? plLocale : enGB,
  });
}

export function daysSince(iso: string, now: Date = new Date()): number {
  const diff = now.getTime() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}
