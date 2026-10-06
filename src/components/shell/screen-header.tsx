"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "./logo";
import { LangSwitch } from "./lang-switch";
import { GuardedLink } from "./navigation-guard";
import { AdminSubNav, type AdminSection } from "./admin-sub-nav";
import { useT } from "~/i18n/i18n-provider";

type Props = {
  title: React.ReactNode;
  back?: { href: string; label: string };
  crumbs?: { label: string; href?: string }[];
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  mobileBarAction?: React.ReactNode;
  mobileHero?: React.ReactNode;
  mobileTitleAside?: React.ReactNode;
  adminSection?: AdminSection;
};

export function ScreenHeader({ title, back, crumbs, meta, actions, mobileBarAction, mobileHero, mobileTitleAside, adminSection }: Props) {
  const t = useT();
  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 bg-brand-900 pl-1 pr-3 text-white md:hidden">
        {back ? (
          <GuardedLink href={back.href} className="flex min-w-0 items-center gap-0.5 px-2 py-2.5 text-[15px] font-bold">
            <ChevronLeft className="h-[22px] w-[22px] flex-none" aria-hidden="true" /><span className="truncate">{back.label}</span>
          </GuardedLink>
        ) : <div className="pl-3"><Logo /></div>}
        <div className="flex flex-none items-center gap-2">{mobileBarAction}<LangSwitch /></div>
      </div>

      {adminSection ? <AdminSubNav active={adminSection} /> : null}

      {/* mobile title / hero */}
      <div className="md:hidden">
        {mobileHero ?? (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[26px] font-extrabold tracking-tight">{title}</h1>
              {mobileTitleAside}
            </div>
            {meta ? <div className="mt-0.5 text-[13px] text-muted-foreground">{meta}</div> : null}
          </div>
        )}
      </div>

      {/* desktop header */}
      <div className="mx-auto hidden w-full max-w-[1200px] flex-col gap-2.5 px-8 pt-6 md:flex">
        {crumbs?.length ? (
          <nav aria-label={t("nav.breadcrumb")} className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {c.href ? <GuardedLink href={c.href} className="hover:text-ink">{c.label}</GuardedLink> : <span className="text-ink">{c.label}</span>}
              </span>
            ))}
          </nav>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-[32px] font-extrabold tracking-tight">{title}</h1>
            {meta ? <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">{meta}</div> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
        </div>
      </div>
    </>
  );
}
