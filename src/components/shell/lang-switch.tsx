"use client";
import { useI18n } from "~/i18n/i18n-provider";
import { cn } from "~/lib/utils";
import type { Locale } from "~/i18n/translate";

export function LangSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="group" aria-label={t("lang.switch")} className={cn("flex rounded-full bg-white/[0.12] p-[3px] text-xs font-bold", className)}>
      {(["en", "pl"] as Locale[]).map((l) => (
        <button key={l} type="button" aria-pressed={locale === l} onClick={() => setLocale(l)}
          className={cn("rounded-full px-2.5 py-1 uppercase", locale === l ? "bg-white text-brand-900" : "text-white")}>{l}</button>
      ))}
    </div>
  );
}
