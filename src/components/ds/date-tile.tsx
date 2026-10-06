"use client";
import { useI18n } from "~/i18n/i18n-provider";
export function DateTile({ date }: { date: string }) {
  const { fmt } = useI18n();
  return (
    <div className="w-11 flex-none rounded-[10px] bg-brand-50 py-1.5 text-center text-brand-700" aria-hidden="true">
      <div className="text-[17px] font-extrabold leading-none">{fmt(date, "dd")}</div>
      <div className="text-[10px] font-extrabold uppercase">{fmt(date, "LLL")}</div>
    </div>
  );
}
