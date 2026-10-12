"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { withAdminLayout } from "~/components/with-admin-layout";
import { ScreenHeader } from "~/components/shell/screen-header";
import { PageBody } from "~/components/ds/page-body";
import { ActionDock } from "~/components/ds/action-dock";
import { SkeletonRows } from "~/components/ds/skeleton-rows";
import { Button } from "~/components/ui/button";
import { DefaultAdminValuesForm } from "~/components/default-admin-values-form.component";
import { DefaultAdminValuesOperations, type DefaultAdminValues } from "~/lib/db";
import { useT } from "~/i18n/i18n-provider";

function DefaultsPage() {
  const t = useT();
  const [value, setValue] = useState<DefaultAdminValues | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    DefaultAdminValuesOperations.getDefaultAdminValues().then(setValue).catch((e) => console.error("Fetch error:", e));
  }, []);

  const save = async () => {
    if (!value) return;
    setSaving(true);
    const { id, ...values } = value;
    try {
      await DefaultAdminValuesOperations.updateDefaultAdminValues(id, values);
      toast.success(t("defaults.saved"));
    } catch (error) {
      console.error("Error updating default values:", error);
      toast.error(t("defaults.failed"));
    } finally {
      setSaving(false);
    }
  };

  const saveButton = <Button className="flex-1 md:flex-none" onClick={() => void save()} disabled={saving || !value}>{saving ? <Loader2 className="animate-spin" /> : null}{t("defaults.save")}</Button>;

  return (
    <>
      <ScreenHeader title={t("defaults.title")} adminSection="defaults" meta={t("defaults.hint")} actions={saveButton} />
      <PageBody className="pb-24 md:pb-0">
        {value ? (
          <section className="max-w-[560px] rounded-2xl border border-line bg-white p-3.5 md:p-5">
            <DefaultAdminValuesForm value={value} onChange={setValue} />
          </section>
        ) : <SkeletonRows count={3} />}
      </PageBody>
      <ActionDock>{saveButton}</ActionDock>
    </>
  );
}
export default withAdminLayout(DefaultsPage);
