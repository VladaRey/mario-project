"use client";
import { ChevronDown, LogIn, LogOut, Shield, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";
import { GuardedLink, useNavigationGuard } from "./navigation-guard";

const pill = "flex h-10 items-center gap-2 rounded-full border border-white/25 pl-1.5 pr-3 text-[13px] font-bold text-white";

export function AccountMenu() {
  const t = useT();
  const router = useRouter();
  const { role, logout } = useGetRole();
  const { confirmLeave } = useNavigationGuard();
  if (role === Role.Guest) {
    return <GuardedLink href="/login" className={`${pill} pl-3.5`}><LogIn className="h-4 w-4" />{t("nav.login")}</GuardedLink>;
  }
  const isAdmin = role === Role.Admin;
  const Icon = isAdmin ? Shield : Star;
  const roleLabel = t(isAdmin ? "role.admin" : "role.fame");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={pill}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.16]"><Icon className="h-[15px] w-[15px]" /></span>
          {roleLabel}<ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 rounded-2xl p-1.5">
        <div className="px-3 py-2 text-[13px] text-muted-foreground">{t("account.loggedInAs", { role: roleLabel })}</div>
        {isAdmin ? <GuardedLink href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-brand-50"><Shield className="h-4 w-4" />{t("account.adminPanel")}</GuardedLink> : null}
        <button type="button" onClick={() => { if (!confirmLeave()) return; logout(); router.push("/"); }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold hover:bg-brand-50">
          <LogOut className="h-4 w-4" />{t("account.logout")}
        </button>
      </PopoverContent>
    </Popover>
  );
}
