"use client";

import { Plus } from "lucide-react";
import { EventsList } from "~/components/events-list";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { Button } from "~/components/ui/button";
import { useGetRole } from "~/hooks/use-get-role";
import { Role } from "~/lib/roles";
import { useT } from "~/i18n/i18n-provider";

export default function HomePage() {
  const t = useT();
  const { role } = useGetRole();
  const newEvent = role === Role.Admin
    ? <Button asChild size="sm" className="md:h-11 md:px-4"><GuardedLink href="/admin/event"><Plus />{t("home.newEvent")}</GuardedLink></Button>
    : undefined;
  return (
    <>
      <ScreenHeader title={t("home.title")} actions={newEvent} mobileTitleAside={newEvent} />
      <PageBody><EventsList variant="public" /></PageBody>
    </>
  );
}
