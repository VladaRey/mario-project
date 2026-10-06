"use client";
import { Plus } from "lucide-react";
import { withAdminLayout } from "~/components/with-admin-layout";
import { EventsList } from "~/components/events-list";
import { ScreenHeader } from "~/components/shell/screen-header";
import { GuardedLink } from "~/components/shell/navigation-guard";
import { PageBody } from "~/components/ds/page-body";
import { Button } from "~/components/ui/button";
import { useT } from "~/i18n/i18n-provider";

function AdminEventsPage() {
  const t = useT();
  const add = <Button asChild size="sm" className="md:h-11 md:px-4"><GuardedLink href="/admin/event"><Plus />{t("hub.newEvent")}</GuardedLink></Button>;
  return (
    <>
      <ScreenHeader title={t("adminEvents.title")} adminSection="events" actions={add} mobileTitleAside={add}
        crumbs={[{ label: t("hub.title"), href: "/admin" }, { label: t("adminEvents.title") }]} />
      <PageBody><EventsList variant="admin" /></PageBody>
    </>
  );
}
export default withAdminLayout(AdminEventsPage);
