"use client";
import { LogOut, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { ResponsiveSheet } from "~/components/ds/responsive-sheet";
import { Button } from "~/components/ui/button";
import { useGetRole } from "~/hooks/use-get-role";
import { useT } from "~/i18n/i18n-provider";
import { useNavigationGuard } from "./navigation-guard";

export function AccountSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const t = useT();
  const router = useRouter();
  const { logout } = useGetRole();
  const { confirmLeave } = useNavigationGuard();
  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title={t("account.title")}>
      <div className="flex flex-col gap-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Star className="h-5 w-5" /></span>
          <div>
            <div className="text-base font-extrabold">{t("account.loggedInAs", { role: t("role.fame") })}</div>
            <div className="text-[13px] text-muted-foreground">{t("account.onThisDevice")}</div>
          </div>
        </div>
        <ul className="list-disc pl-5 text-sm leading-relaxed text-[#4A4361]">
          <li>{t("account.fameCan1")}</li><li>{t("account.fameCan2")}</li><li>{t("account.fameCan3")}</li>
        </ul>
        <Button variant="outline" onClick={() => { if (!confirmLeave()) return; logout(); onOpenChange(false); router.push("/"); }}>
          <LogOut />{t("account.logout")}
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
