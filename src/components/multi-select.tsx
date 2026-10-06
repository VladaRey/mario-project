"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "~/lib/utils";
import type { CardType } from "~/lib/db";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { Chip, CardTypeChip } from "~/components/ds/chip";
import { PlayerAvatar } from "~/components/ds/player-avatar";
import { SectionLabel } from "~/components/ds/section-label";
import { useIsDesktop } from "~/hooks/use-media-query";
import { useT } from "~/i18n/i18n-provider";
import { matchesQuery, orderOptions } from "~/utils/search";

export type PickerOption = { value: string; label: string; disabled?: boolean; hint?: string; cardType?: CardType };

type MultiSelectProps = {
  options: PickerOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  title?: string;
};

export function MultiSelect({ options = [], selected = [], onChange, placeholder, title }: MultiSelectProps) {
  const t = useT();
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () => orderOptions(options.filter((o) => matchesQuery(o.label, query)), selected),
    [options, query, selected],
  );
  const selectedOptions = options.filter((o) => selected.includes(o.value));

  const toggle = (o: PickerOption) => {
    if (o.disabled) return;
    onChange(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value]);
  };

  const onListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'));
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "ArrowDown" ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
    items[next]?.focus();
  };

  const triggerContent = (
    <>
      {selectedOptions.length === 0 ? (
        <span className="truncate text-muted-foreground">{placeholder ?? t("picker.placeholder")}</span>
      ) : (
        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          {selectedOptions.slice(0, 3).map((o) => <Chip key={o.value} tone="violet">{o.label}</Chip>)}
          {selectedOptions.length > 3 ? <span className="text-xs text-muted-foreground">{t("picker.more", { count: selectedOptions.length - 3 })}</span> : null}
        </span>
      )}
      <ChevronDown className="h-[18px] w-[18px] flex-none text-muted-foreground" aria-hidden="true" />
    </>
  );
  const triggerClass = "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2 text-left text-sm";

  const searchBox = (
    <label className="flex h-12 items-center gap-2 rounded-xl border-2 border-brand-700 bg-white px-3">
      <Search className="h-[18px] w-[18px] text-brand-700" aria-hidden="true" />
      <input type="search" autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder={t("picker.search")} aria-label={t("picker.search")}
        className="min-w-0 flex-1 bg-transparent text-base font-bold outline-none" />
      {query ? (
        <button type="button" onClick={() => setQuery("")} aria-label={t("picker.clearSearch")}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ECE7F6]"><X className="h-3.5 w-3.5" /></button>
      ) : null}
    </label>
  );

  const list = (
    <div role="listbox" aria-multiselectable="true" aria-label={title ?? t("picker.title")} onKeyDown={onListKeyDown} className="flex flex-col">
      <SectionLabel className="pb-1 pt-2">{t("picker.matches", { count: visible.length })}</SectionLabel>
      {visible.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground">{t("common.noResults")}</div> : null}
      {visible.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button key={o.value} type="button" role="option" aria-selected={on} aria-disabled={o.disabled || undefined}
            onClick={() => toggle(o)}
            className={cn("flex min-h-[52px] items-center gap-3 border-b border-[#F0ECF7] py-2 text-left last:border-0 focus:bg-brand-50 focus:outline-none",
              o.disabled && "cursor-not-allowed text-muted-foreground")}>
            <span className={cn("flex h-6 w-6 flex-none items-center justify-center rounded-lg",
              on ? "bg-brand-900 text-white" : o.disabled ? "bg-[#F4F2F8]" : "border-2 border-[#D8D2E6]")}>
              {on ? <Check className="h-[15px] w-[15px]" strokeWidth={3} /> : null}
            </span>
            {o.cardType ? <PlayerAvatar name={o.label} cardType={o.cardType} /> : null}
            <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{o.label}</span>
            {o.hint ? <Chip tone="danger">{o.hint}</Chip> : null}
            {o.cardType ? <CardTypeChip cardType={o.cardType} short /> : null}
          </button>
        );
      })}
    </div>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
        <PopoverTrigger asChild>
          <button type="button" role="combobox" aria-expanded={open} aria-haspopup="listbox" className={triggerClass}>{triggerContent}</button>
        </PopoverTrigger>
        <PopoverContent align="start" className="max-h-[420px] w-[--radix-popover-trigger-width] min-w-[340px] overflow-y-auto rounded-2xl p-3">
          {searchBox}
          {list}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <>
      <button type="button" role="combobox" aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(true)} className={triggerClass}>
        {triggerContent}
      </button>
      <ResponsiveSheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}
        title={title ?? t("picker.title")}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onChange([])}>{t("picker.clear")}</Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>{t("picker.done", { count: selected.length })}</Button>
          </div>
        }>
        <div className="flex flex-col gap-2.5">
          {searchBox}
          {selectedOptions.length ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedOptions.map((o) => (
                <button key={o.value} type="button" onClick={() => toggle(o)} aria-label={`${t("common.remove")} ${o.label}`}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-extrabold text-brand-700">
                  {o.label}<X className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}
          <div className="text-xs text-muted-foreground">{t("picker.searchHint")}</div>
          {list}
        </div>
      </ResponsiveSheet>
    </>
  );
}
